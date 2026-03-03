const natural = require('natural');
const TfIdf = natural.TfIdf;
const Tesseract = require('tesseract.js');
const pdfImgConvert = require('pdf-img-convert');
const fs = require('fs');

const commonSkills = ['react', 'node', 'javascript', 'python', 'sql', 'css', 'html', 'aws', 'docker', 'typescript', 'mongodb', 'postgresql', 'graphql', 'figma', 'ui', 'ux'];

/**
 * Normalizes text for better matching (lowercase, strip special chars)
 */
const normalize = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Heuristic to extract total years of experience from resume text
 */
const extractExperienceYears = (text) => {
    // 1. Look for patterns like "5 years", "3+ years"
    const yearsRegex = /(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?experience/gi;
    let maxYears = 0;
    let match;
    while ((match = yearsRegex.exec(text)) !== null) {
        const years = parseInt(match[1]);
        if (years > maxYears) maxYears = years;
    }

    // 2. Parse Date Ranges (e.g., "2018 - 2021", "Jan 2016 to Present")
    const dateRangeRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(20\d{2})\s*(?:-|–|to)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(20\d{2}|Present|Current)/gi;

    let totalMonths = 0;
    const currentYear = new Date().getFullYear();

    while ((match = dateRangeRegex.exec(text)) !== null) {
        const startYear = parseInt(match[1]);
        const endYearStr = match[2].toLowerCase();
        const endYear = (endYearStr.includes('present') || endYearStr.includes('current')) ? currentYear : parseInt(endYearStr);

        if (endYear >= startYear) {
            totalMonths += (endYear - startYear) * 12;
        }
    }

    const calculatedYears = Math.round(totalMonths / 12);
    return Math.max(maxYears, calculatedYears);
};

/**
 * Helper to extract number from job experience string (e.g., "5+ Yrs" -> 5)
 */
const parseJobRequiredYears = (jobExpStr) => {
    if (!jobExpStr) return 0;
    const match = jobExpStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

/**
 * Calculates match scores and identifies missing skills.
 */
exports.calculateMatchScore = (jobDescription, resumeText, manualRequiredSkills = '', jobExperienceReq = '') => {
    console.log('--- AI Match Engine Trace ---');
    console.log('Job Exp Req:', jobExperienceReq);

    // 1. TF-IDF for Cosine Similarity
    const tfidf = new TfIdf();
    tfidf.addDocument(jobDescription.toLowerCase());
    tfidf.addDocument(resumeText.toLowerCase());

    const terms = new Set();
    tfidf.listTerms(0).forEach(item => terms.add(item.term));
    tfidf.listTerms(1).forEach(item => terms.add(item.term));

    const vec1 = [];
    const vec2 = [];

    terms.forEach(term => {
        let score1 = 0;
        let score2 = 0;
        tfidf.tfidfs(term, (i, score) => {
            if (i === 0) score1 = score;
            if (i === 1) score2 = score;
        });
        vec1.push(score1);
        vec2.push(score2);
    });

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    let contextualMatch = 0;
    if (mag1 !== 0 && mag2 !== 0) {
        contextualMatch = (dotProduct / (mag1 * mag2));
    }

    // 2. Skill Match Analysis (Normalization-based)
    const jobTextNormalized = normalize(jobDescription);
    const resumeNormalized = normalize(resumeText);

    let targetSkills = [];
    if (manualRequiredSkills && manualRequiredSkills.trim()) {
        targetSkills = manualRequiredSkills.split(',').map(s => s.trim()).filter(s => s);
    } else {
        targetSkills = commonSkills.filter(skill => jobDescription.toLowerCase().includes(skill.toLowerCase()));
    }

    const presentSkills = targetSkills.filter(skill => {
        const normalizedSkill = normalize(skill);
        // Direct match or partial match for common variations
        return resumeNormalized.includes(normalizedSkill) || resumeText.toLowerCase().includes(skill.toLowerCase());
    });

    const missingSkills = targetSkills.filter(skill => !presentSkills.includes(skill));

    const skillMatchRatio = targetSkills.length > 0 ? presentSkills.length / targetSkills.length : 1;
    let skillScore = Math.round(skillMatchRatio * 100);

    // Boost with contextual similarity
    skillScore = Math.min(100, Math.round(skillScore * 0.9 + (contextualMatch * 10)));

    // 3. Experience Match Analysis
    const candidateYears = extractExperienceYears(resumeText);
    const requiredYears = parseJobRequiredYears(jobExperienceReq);

    console.log('Candidate Years Extracted:', candidateYears);
    console.log('Required Years Extracted:', requiredYears);

    let expScore = 100;
    if (requiredYears > 0) {
        if (candidateYears >= requiredYears) {
            expScore = 100;
        } else {
            expScore = Math.round((candidateYears / requiredYears) * 90);
        }
    }

    // 4. Final Weighted Overall Score
    let finalOverall = Math.round((skillMatchRatio * 60) + (contextualMatch * 30) + ((expScore / 100) * 10));

    if (targetSkills.length > 0 && presentSkills.length === targetSkills.length) {
        finalOverall = Math.max(finalOverall, 85 + Math.round(contextualMatch * 15));
    }

    console.log('Final Score:', finalOverall);
    console.log('Present Skills:', presentSkills.join(', '));
    console.log('----------------------------');

    return {
        score: Math.min(Math.max(finalOverall, 0), 100),
        skillScore: Math.min(skillScore, 100),
        expScore: Math.min(expScore, 100),
        missingSkills: missingSkills.join(', '),
        presentSkills: presentSkills.join(', ')
    };
};

/**
 * Performs OCR on a PDF file by converting it to images first.
 */
exports.performOCR = async (pdfPath) => {
    console.log('[OCR] --- Triggering OCR Fallback ---');
    console.log('[OCR] Path:', pdfPath);
    try {
        console.log('[OCR] Converting PDF to images...');
        // 1. Convert PDF to images (first 3 pages to save time/resources)
        const pdfImages = await pdfImgConvert.convert(pdfPath, {
            width: 1200,
            page_numbers: [1, 2, 3]
        });
        console.log(`[OCR] Converted ${pdfImages.length} pages.`);

        if (!pdfImages.length) {
            console.error('[OCR] No images generated from PDF.');
            return '';
        }

        console.log('[OCR] Initializing Tesseract worker...');
        const worker = await Tesseract.createWorker('eng', 1, {
            logger: m => console.log(`[Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`)
        });

        let fullText = '';
        for (let i = 0; i < pdfImages.length; i++) {
            console.log(`[OCR] Recognizing Page ${i + 1}...`);
            const { data: { text } } = await worker.recognize(pdfImages[i]);
            fullText += text + '\n';
        }

        await worker.terminate();
        console.log('[OCR] OCR Process Complete.');
        console.log('[OCR] Extracted text length:', fullText.length);
        return fullText;
    } catch (err) {
        console.error('[OCR] Extraction Failed:', err);
        return '';
    }
};

/**
 * Generates interview questions dynamically based on resume and job context.
 */
exports.generateInterviewQuestions = (skills, jobTitle, experience) => {
    const questions = {
        technical: [],
        behavioral: [
            "Tell me about a challenging project you worked on and how you handled it.",
            "How do you stay updated with the latest industry trends?",
            "Describe a time you had to work with a difficult team member."
        ],
        experience: []
    };

    const skillList = skills ? skills.split(',').map(s => s.trim()) : [];

    // Technical questions based on skills
    skillList.slice(0, 5).forEach(skill => {
        questions.technical.push(`Explain the core concepts of ${skill} and how you've used it in your projects.`);
        questions.technical.push(`What are some common challenges you face when working with ${skill}?`);
    });

    // Experience-based questions
    if (experience) {
        questions.experience.push(`Based on your ${experience} of experience, how have you seen the role of a ${jobTitle || 'Professional'} evolve?`);
        questions.experience.push(`Can you describe a high-impact decision you made in your previous role?`);
    } else {
        questions.experience.push(`What motivated you to apply for this ${jobTitle || 'role'}?`);
        questions.experience.push(`Where do you see yourself professionally in the next 3 years?`);
    }

    return questions;
};

/**
 * Rule-based recommendation engine.
 */
exports.calculateFinalRecommendation = (resumeScore, skillMatch, interviewScore) => {
    const totalScore = (resumeScore * 0.3) + (skillMatch * 0.2) + (interviewScore * 0.5);

    let recommendation = 'Hold';
    if (totalScore >= 80) recommendation = 'Hire';
    else if (totalScore < 50) recommendation = 'Reject';

    return {
        totalScore: Math.round(totalScore),
        recommendation,
        breakdown: {
            resume: resumeScore,
            skills: skillMatch,
            interview: interviewScore
        }
    };
};
