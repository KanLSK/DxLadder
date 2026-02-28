require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

const caseSchema = new mongoose.Schema({
    finalDiagnosis: { type: String, required: true },
    aliases: { type: [String], default: [] },
    hints: { type: [String], required: true },
    teachingPoints: { type: [String], default: [] },
    systemTags: { type: [String], default: [] },
    diseaseTags: { type: [String], default: [] },
    difficulty: { type: Number, required: true },
    sourceType: { type: String, default: 'curated' },
}, { timestamps: { createdAt: true, updatedAt: false } });

const CaseLibrary = mongoose.models.CaseLibrary || mongoose.model('CaseLibrary', caseSchema, 'casesLibrary');

const initialCases = [
  {
    finalDiagnosis: 'Myocardial Infarction',
    aliases: ['MI', 'heart attack', 'stemi', 'nstemi'],
    hints: [
      'A 65-year-old male presents to the ED complaining of discomfort.',
      'He is diaphoretic and appears pale. BP is 150/90, HR 110.',
      'He describes the discomfort as a "heavy pressure" in the center of his chest that started 2 hours ago while mowing the lawn.',
      'The pain radiates to his left jaw and left arm. He has a history of hypertension and hyperlipidemia.',
      'ECG reveals 3mm ST segment elevations in leads V2-V4.'
    ],
    teachingPoints: [
      'Classic presentation involves substernal chest pressure radiating to the jaw/arm.',
      'Diaphoresis and nausea are common autonomic symptoms.',
      'ST elevations in anterior leads (V2-V4) indicate LAD (LAD territory) involvement.',
      'Immediate reperfusion (PCI or fibrinolytics) is critical for STEMI.'
    ],
    systemTags: ['Cardiovascular'],
    diseaseTags: ['Ischemic'],
    difficulty: 1
  },
  {
    finalDiagnosis: 'Pulmonary Embolism',
    aliases: ['PE'],
    hints: [
      'A 40-year-old female presents with sudden onset shortness of breath.',
      'Vitals: HR 120, RR 24, O2 sat 88% on room air, Temp 98.6F.',
      'Lungs are clear to auscultation bilaterally. Heart rate is tachycardic but regular.',
      'She recently returned from a 14-hour flight from Tokyo. She takes oral contraceptives.',
      'CT pulmonary angiogram reveals a filling defect in the right main pulmonary artery.'
    ],
    teachingPoints: [
      'Think of PE in patients with unexplained hypoxia, tachycardia, and clear lungs.',
      'Risk factors include prolonged immobilization (long flights), OCP use, and malignancy.',
      'CTPA is the gold standard imaging modality.',
      'ECG may show sinus tachycardia or infrequently the S1Q3T3 pattern.'
    ],
    systemTags: ['Respiratory', 'Cardiovascular'],
    diseaseTags: ['Vascular'],
    difficulty: 2
  },
  {
    finalDiagnosis: 'Streptococcus pneumoniae Meningitis',
    aliases: ['bacterial meningitis', 'pneumococcal meningitis', 'meningitis'],
    hints: [
      'A 19-year-old college student is brought in by roommates for confusion.',
      'He has had a severe headache and fever for 24 hours. Temp is 103.1F.',
      'Physical exam reveals nuchal rigidity. No petechial rash is observed.',
      'CSF analysis shows: WBC 2,500 (90% neutrophils), glucose 20 mg/dL, protein 250 mg/dL.',
      'Gram stain of the CSF reveals Gram-positive diplococci.'
    ],
    teachingPoints: [
      'Classic triad: fever, headache, nuchal rigidity.',
      'Bacterial CSF profile: drastically elevated WBCs (neutrophil predominant), low glucose, high protein.',
      'S. pneumoniae is the most common cause of community-acquired bacterial meningitis in adults and presents as Gram-positive diplococci.',
      'Empiric therapy must include Ceftriaxone, Vancomycin, and Dexamethasone.'
    ],
    systemTags: ['Neurological'],
    diseaseTags: ['Infectious'],
    difficulty: 3
  },
  {
      finalDiagnosis: 'Pheochromocytoma',
      aliases: ['pheo'],
      hints: [
        'A 35-year-old female presents with episodic spells of feeling unwell.',
        'During these spells, she experiences severe headaches, sweating, and palpitations.',
        'Her resting blood pressure in the clinic is 180/110 mmHg. She is not overweight and does not smoke.',
        'She mentions a family history of thyroid cancer (medullary type) and hyperparathyroidism.',
        '24-hour urine collection shows significantly elevated fractionated metanephrines and catecholamines.'
      ],
      teachingPoints: [
        'Classic triad of symptoms: severe headaches, diaphoresis, and palpitations.',
        'Often presents as medically refractory or paroxysmal hypertension.',
        'Associated with MEN 2A and 2B syndromes (indicated by her family history of medullary thyroid cancer).',
        'Diagnosis is confirmed via plasma free metanephrines or 24-hour urine fractionated metanephrines.'
      ],
      systemTags: ['Endocrine'],
      diseaseTags: ['Neoplastic'],
      difficulty: 4
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Wipe existing cases in the library for a fresh seed
    await CaseLibrary.deleteMany({});
    console.log('Cleared existing CaseLibrary collection');

    const result = await CaseLibrary.insertMany(initialCases);
    console.log(`Successfully inserted ${result.length} cases.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
