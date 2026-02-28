import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Minimal definition to satisfy TS without importing the complex Next.js app model
const CaseSchema = new mongoose.Schema({
  origin: { type: String, enum: ['curated', 'ai_generated', 'user_submitted'], required: true },
  status: { type: String, enum: ['draft', 'needs_review', 'community_approved', 'library_promoted', 'disabled'], required: true, default: 'draft' },
  title: { type: String, required: true },
  systemTags: [{ type: String }],
  difficulty: { type: Number, min: 1, max: 5, required: true },
  style: { type: String, required: true, default: 'vignette' },
  targetAudience: { type: String, required: true, default: 'clinical' },
  generationParams: { type: mongoose.Schema.Types.Mixed },

  contentPublic: {
    layers: {
      presentationTimeline: { type: String, required: true },
      hpi: { type: String, required: true },
      history: {
        pmh: { type: String }, psh: { type: String }, meds: { type: String }, allergy: { type: String }, social: { type: String }, family: { type: String }
      },
      physicalExam: {
        general: { type: String }, cvs: { type: String }, rs: { type: String }, gi: { type: String }, neuro: { type: String }, kub: { type: String }, msk: { type: String }, others: { type: String }
      },
      labs: {
        cbc: { type: String }, chemistry: { type: String }, others: { type: String }
      },
      imaging: [{
        type: { type: String }, caption: { type: String }, imageUrl: { type: String }
      }],
      pathognomonic: { type: String, default: null }
    }
  },

  contentPrivate: {
    diagnosis: { type: String, required: true },
    aliases: [{ type: String }],
    acceptRules: { type: mongoose.Schema.Types.Mixed },
    teachingPoints: [{ type: String }],
    answerCheck: {
      rationale: { type: String },
      keyDifferentials: [{ type: String }]
    },
    mechanismQuestions: { type: mongoose.Schema.Types.Mixed }
  },

  metrics: {
    plays: { type: Number, default: 0 },
    solveRate: { type: Number, default: 0 },
    avgLayersUsed: { type: Number, default: 0 }
  },
  community: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    realismAvg: { type: Number, default: 0 }
  },
  safetyFlags: {
    incorrect: { type: Number, default: 0 },
    unsafe: { type: Number, default: 0 }
  }
}, { timestamps: true });

const CaseDb = mongoose.models.Case || mongoose.model('Case', CaseSchema);

const freeCases = [
  // 1. Cardiovascular
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '65M with crushing chest pain',
    systemTags: ['Cardiovascular'],
    difficulty: 1,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Hours)',
        hpi: 'A 65-year-old male presents to the ED complaining of central chest pressure. He states it started 2 hours ago while he was mowing the lawn. It is unremitting, rated 8/10, and radiates to his left jaw. He has severe nausea and is profusely diaphoretic.',
        history: { pmh: 'Hypertension, Hyperlipidemia', meds: 'Lisinopril, Atorvastatin', social: '40 pack-year smoking history' },
        physicalExam: { general: 'Appears uncomfortable, diaphoretic, clutching his chest.', cvs: 'Tachycardic, regular rhythm. No murmurs or gallops. Normal pulses.', rs: 'Clear to auscultation bilaterally.' },
        labs: { chemistry: 'Initial high-sensitivity troponin elevates mildly.', others: 'ECG: Normal sinus rhythm with 3mm ST segment elevations in anterior leads V2-V4.' }
      }
    },
    contentPrivate: {
      diagnosis: 'Anterior Myocardial Infarction',
      aliases: ['STEMI', 'Myocardial Infarction', 'Heart Attack', 'Anterior STEMI'],
      teachingPoints: [
        'Classic presentation of myocardial infarction includes heavy, pressure-like chest pain radiating to the jaw or left arm.',
        'Associated symptoms often include diaphoresis, dyspnea, and nausea.',
        'ST elevations in leads V2-V4 indicate an anterior injury, typically involving the Left Anterior Descending (LAD) artery.',
        'Immediate reperfusion via primary PCI or fibrinolytics is critical to salvage myocardium.'
      ],
      answerCheck: {
        rationale: 'The patient presents with classic symptoms of cardiac ischemia and an ECG diagnostic of an anterior STEMI.',
        keyDifferentials: ['Aortic Dissection', 'Pulmonary Embolism', 'Pericarditis']
      }
    }
  },
  // 2. Respiratory
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '40F with sudden onset shortness of breath',
    systemTags: ['Respiratory'],
    difficulty: 2,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Minutes to Hours)',
        hpi: 'A 40-year-old female presents to the ED with sudden onset of severe shortness of breath and right-sided pleuritic chest pain that started 1 hour ago. She feels lightheaded.',
        history: { pmh: 'None', social: 'Recently returned earlier today from a 14-hour direct flight from Tokyo. Occasional alcohol.', meds: 'Oral contraceptives' },
        physicalExam: { general: 'Anxious, tachypneic.', cvs: 'Heart rate 125 bpm, regular rhythm. BP 110/70. Oxygen saturation is 88% on room air.', rs: 'Lungs are remarkably clear to auscultation bilaterally despite significant hypoxemia.', others: 'Mild swelling of the right calf.' },
        labs: { others: 'ECG shows sinus tachycardia. D-dimer is markedly elevated. Chest X-ray is normal.' },
        pathognomonic: 'CT pulmonary angiogram reveals a large filling defect in the right main pulmonary artery.'
      }
    },
    contentPrivate: {
      diagnosis: 'Pulmonary Embolism',
      aliases: ['PE', 'VTE'],
      teachingPoints: [
        'Sudden onset dyspnea and pleuritic chest pain in a patient with risk factors (prolonged immobilization, OCP use) strongly suggest PE.',
        'The combination of significant hypoxia with a clear chest X-ray and clear lung auscultation is a classic hint.',
        'CT pulmonary angiography is the gold standard diagnostic imaging.',
        'Anticoagulation must be initiated immediately if clinical suspicion is high, even prior to definitive imaging in some settings.'
      ],
      answerCheck: {
        rationale: 'The combination of prolonged immobilization, OCP use, sudden hypoxia with a clear chest, and a filling defect on CT is diagnostic of a pulmonary embolism.',
        keyDifferentials: ['Pneumothorax', 'Pneumonia', 'Myocardial Infarction']
      }
    }
  },
  // 3. Neurological
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '19M college student with confusion',
    systemTags: ['Neurological'],
    difficulty: 2,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Hours to Days)',
        hpi: 'A 19-year-old college student living in a dormitory is brought to the ED by his roommates because he is acutely confused and lethargic. He complained of a severe, unremitting global headache and photophobia starting yesterday.',
        history: { pmh: 'Healthy', social: 'College sophomore, lives in highly populated dorm.' },
        physicalExam: { general: 'Lethargic, difficult to rouse, but follows commands. Temp 103.1F.', neuro: 'Marked resistance to passive neck flexion (nuchal rigidity). Positive Kernig and Brudzinski signs.', others: 'Skin exam shows no petechiae or purpura.' },
        labs: { blood: 'WBC 18,000 with 90% neutrophils.', others: 'Lumbar puncture (CSF): WBC 2,500 (90% neutrophils), glucose 20 mg/dL (serum level 90), protein 250 mg/dL.' },
        pathognomonic: 'Gram stain of the CSF reveals abundant Gram-positive diplococci.'
      }
    },
    contentPrivate: {
      diagnosis: 'Bacterial Meningitis',
      aliases: ['Pneumococcal Meningitis', 'Streptococcus pneumoniae Meningitis', 'Meningitis'],
      acceptRules: {
        customSynonyms: { 'Bacterial Meningitis': ['Pneumococcal Meningitis', 'Streptococcal Meningitis', 'Meningitis'] }
      },
      teachingPoints: [
        'The classic triad of meningitis is fever, headache, and nuchal rigidity.',
        'A bacterial CSF profile typically shows a vastly elevated opening pressure, high white blood cell count (predominantly neutrophils), low glucose, and high protein.',
        'S. pneumoniae is the most common cause of community-acquired bacterial meningitis and presents as Gram-positive diplococci on Gram stain.',
        'Empiric therapy with Ceftriaxone and Vancomycin (plus steroids) is required before culture results.'
      ],
      answerCheck: {
        rationale: 'The classic meningeal signs, typical bacterial CSF profile, and a Gram stain showing Gram-positive diplococci firmly establish pneumococcal meningitis.',
        keyDifferentials: ['Viral Meningitis', 'Subarachnoid Hemorrhage', 'Encephalitis']
      }
    }
  },
  // 4. Gastrointestinal
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '45F with severe right upper quadrant pain',
    systemTags: ['Gastrointestinal'],
    difficulty: 2,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Hours)',
        hpi: 'A 45-year-old female presents with severe, colicky pain in the right upper quadrant of her abdomen. It started 1 hour after eating a fast-food hamburger. The pain radiates to her right scapula.',
        history: { pmh: 'Obesity (BMI 32)', social: 'Occasional alcohol. Diet high in fats.' },
        physicalExam: { general: 'In severe distress from pain. Temp 101.0F.', gi: 'Exquisitely tender to palpation in the RUQ. Inspiration is arrested upon deep palpation of the RUQ (positive Murphy sign).' },
        labs: { chemistry: 'AST and ALT are mildly elevated. Total bilirubin is 1.1 mg/dL. Alkaline phosphatase is normal.', cbc: 'WBC is 14,000.' },
        pathognomonic: 'Right upper quadrant ultrasound demonstrates a thickened gallbladder wall (5mm), pericholecystic fluid, and a hyperechoic structure with acoustic shadowing within the gallbladder neck.'
      }
    },
    contentPrivate: {
      diagnosis: 'Acute Cholecystitis',
      aliases: ['Cholecystitis', 'Gallstone disease', 'Gallbladder inflammation'],
      teachingPoints: [
        'Classic patient demographic is the "4 Fs": Female, Fat, Forty, Fertile (though it can happen to anyone).',
        'Postprandial RUQ pain radiating to the right scapula is highly suggestive of biliary colic or cholecystitis.',
        'A positive Murphy sign (inspiratory arrest on RUQ palpation) has high specificity for acute cholecystitis.',
        'Ultrasound findings of wall thickening (>4mm), pericholecystic fluid, and sonographic Murphy sign confirm the diagnosis.'
      ],
      answerCheck: {
        rationale: 'The patient has clinical signs of inflammation (fever, leukocytosis, Murphy sign) accompanied by definitive ultrasound evidence of gallbladder inflammation and stones.',
        keyDifferentials: ['Biliary Colic', 'Cholangitis', 'Peptic Ulcer Disease', 'Pancreatitis']
      }
    }
  },
  // 5. Endocrine
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '35F with episodic panic attacks and hypertension',
    systemTags: ['Endocrine'],
    difficulty: 4,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Episodic (Months)',
        hpi: 'A 35-year-old female presents to clinic reporting spells of feeling terrible. During these spells, which last 20-30 minutes, she experiences a severe pounding headache, heavy sweating, and rapid palpitations. She describes it as "feeling like I am going to die."',
        history: { pmh: 'Recently diagnosed with treatment-resistant hypertension. No history of anxiety disorders.', family: 'Father died of medullary thyroid cancer. Brother had parathyroid surgery.' },
        physicalExam: { general: 'Thin, anxious.', cvs: 'Resting BP is 185/115 mmHg, HR 105 bpm.', others: 'No tremors at rest.' },
        labs: { chemistry: 'Basic metabolic panel is completely normal. TSH is normal.', others: '24-hour urine collection reveals markedly elevated fractionated metanephrines and normetanephrines.' }
      }
    },
    contentPrivate: {
      diagnosis: 'Pheochromocytoma',
      aliases: ['Pheo', 'Paraganglioma'],
      teachingPoints: [
        'The classic triad of pheochromocytoma consists of episodic severe headaches, diaphoresis, and palpitations.',
        'It is a classic, though rare, cause of secondary, medically refractory hypertension.',
        'Family history is crucial: her family history of Medullary Thyroid Cancer and hyperparathyroidism suggests Multiple Endocrine Neoplasia type 2A (MEN 2A), strongly pointing to Pheochromocytoma.',
        'Diagnosis is confirmed via plasma free metanephrines or 24-hour urine fractionated metanephrines.'
      ],
      answerCheck: {
        rationale: 'The presence of the classic triad, severe refractory hypertension, elevated urine metanephrines, and a family history suggesting MEN 2A all confirm pheochromocytoma.',
        keyDifferentials: ['Panic Disorder', 'Hyperthyroidism', 'Essential Hypertension']
      }
    }
  },
  // 6. Genitourinary
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '28M with sudden, excruciating flank pain',
    systemTags: ['Genitourinary'],
    difficulty: 1,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Hours)',
        hpi: 'A 28-year-old male is brought to the ED writhing in pain. He describes a sudden-onset, excruciating 10/10 sharp pain in his left flank that radiates to his left groin. He is nauseous and vomited twice in the car.',
        history: { pmh: 'Appendectomy in childhood. No chronic diseases.', meds: 'None.' },
        physicalExam: { general: 'Unable to sit still, writhing on the stretcher.', gi: 'Abdomen is soft, non-tender to direct palpation. No guarding.', others: 'Left costovertebral angle (CVA) tenderness is present.' },
        labs: { others: 'Urinalysis shows gross hematuria with numerous RBCs per high power field. No WBCs, no leukocyte esterase, no nitrites.' },
        pathognomonic: 'Non-contrast CT scan of the abdomen and pelvis shows a 5mm radiodense structure in the left ureter with mild proximal hydronephrosis.'
      }
    },
    contentPrivate: {
      diagnosis: 'Nephrolithiasis',
      aliases: ['Kidney Stone', 'Ureteral Calculus', 'Renal Colic'],
      acceptRules: {
        customSynonyms: { 'Nephrolithiasis': ['Kidney Stone', 'Ureterolithiasis', 'Renal Calculus'] }
      },
      teachingPoints: [
        'Classic renal colic presents as sudden, severe unilateral flank pain radiating to the groin.',
        'Patients are characteristically unable to sit still and writhe in pain, contrasting with peritonitis where patients lie perfectly still.',
        'Hematuria is present in the vast majority of symptomatic kidney stones.',
        'Non-contrast CT is the gold standard imaging modality for diagnosing nephrolithiasis.'
      ],
      answerCheck: {
        rationale: 'The presentation of severe flank-to-groin pain, writhing behavior, hematuria, and direct visualization of a stone on non-contrast CT are definitive for nephrolithiasis.',
        keyDifferentials: ['Pyelonephritis', 'Abdominal Aortic Aneurysm (in older adults)', 'Appendicitis']
      }
    }
  },
  // 7. Hematology/Oncology
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '55M with fatigue and massive splenomegaly',
    systemTags: ['Hematology/Oncology'],
    difficulty: 4,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Chronic (Months)',
        hpi: 'A 55-year-old male presents with worsening fatigue, night sweats, and early satiety over the last 6 months. He states that lately he feels full after eating only a few bites of food.',
        history: { pmh: 'None.', social: 'Works as a banker.' },
        physicalExam: { general: 'Pale but largely comfortable.', gi: 'Massive splenomegaly, with the spleen edge palpable across the midline and down into the left lower quadrant.', others: 'No peripheral lymphadenopathy.' },
        labs: { cbc: 'WBC count is strikingly elevated at 150,000/microL with a full spectrum of granulocytic differentiation from blasts (1%) to mature neutrophils. Basophils are prominent. Hemoglobin is 10.5 g/dL, Platelets 550,000/microL.', chemistry: 'Leukocyte alkaline phosphatase (LAP) score is extremely low.' },
        pathognomonic: 'Bone marrow cytogenetics reveal a t(9;22) translocation.'
      }
    },
    contentPrivate: {
      diagnosis: 'Chronic Myeloid Leukemia',
      aliases: ['CML'],
      teachingPoints: [
        'Patients with CML often present insidiously with fatigue, weight loss, or abdominal fullness/early satiety due to massive splenomegaly.',
        'The peripheral blood smear characteristically shows a vastly elevated WBC count with a "left shift" involving ALL stages of granulocyte maturation, notably including increased basophils and eosinophils.',
        'A very low Leukocyte Alkaline Phosphatase (LAP) score helps differentiate CML from a leukemoid reaction (where LAP is high).',
        'The t(9;22) translocation results in the Philadelphia chromosome and the BCR-ABL1 fusion gene, which is a targetable tyrosine kinase (via imatinib).'
      ],
      answerCheck: {
        rationale: 'The combination of massive splenomegaly, extreme leukocytosis with a full spectrum of granulocyte precursors, low LAP score, and definitively the t(9;22) translocation confirms CML.',
        keyDifferentials: ['Leukemoid Reaction', 'Acute Myeloid Leukemia', 'Primary Myelofibrosis']
      }
    }
  },
  // 8. Musculoskeletal
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '60M with sudden, exquisitely painful red toe',
    systemTags: ['Musculoskeletal'],
    difficulty: 1,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Acute (Overnight)',
        hpi: 'A 60-year-old male awakens in the middle of the night with excruciating pain in his right big toe. The pain is so severe that he cannot bear the weight of a bedsheet resting on it. He attended a steak dinner with heavy alcohol consumption the evening before.',
        history: { pmh: 'Hypertension, treated with Hydrochlorothiazide.', meds: 'Hydrochlorothiazide, daily low-dose aspirin.' },
        physicalExam: { general: 'Limping into the clinic.', msk: 'The right first metatarsophalangeal (MTP) joint is swollen, erythematous, warm, and exquisitely tender to the slightest touch.' },
        labs: { chemistry: 'Serum uric acid level is 9.5 mg/dL.', others: 'Joint aspiration reveals cloudy yellow fluid. Crystal analysis under polarized light microscopy shows negatively birefringent, needle-shaped crystals.' }
      }
    },
    contentPrivate: {
      diagnosis: 'Gout',
      aliases: ['Acute Gout', 'Gouty Arthritis', 'Podagra'],
      teachingPoints: [
        'Podagra (acute inflammation of the first MTP joint) is the classic initial presentation of gout.',
        'Triggers commonly include purine-rich foods (steak, seafood), alcohol (especially beer), and certain medications like thiazide diuretics (HCTZ).',
        'Diagnosis is definitively made by visualizing needle-shaped, negatively birefringent urate crystals in synovial fluid.',
        'While uric acid levels are generally high, normal serum uric acid during an acute attack does NOT rule out gout.'
      ],
      answerCheck: {
        rationale: 'The sudden nocturnal onset of typical podagra, associated with classic triggers (steak, alcohol, HCTZ), and definitive finding of negatively birefringent crystals confirms gout.',
        keyDifferentials: ['Pseudogout (Calcium Pyrophosphate Deposition)', 'Septic Arthritis', 'Cellulitis']
      }
    }
  },
  // 9. Psychiatry
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '22M with auditory hallucinations and paranoia',
    systemTags: ['Psychiatry'],
    difficulty: 2,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Subacute (Months)',
        hpi: 'A 22-year-old man is brought to the clinic by his parents because he has locked himself in his room for the past two months. He believes his neighbors are aiming radiation beams into his house to steal his thoughts. He frequently holds conversations out loud with people who are not in the room.',
        history: { pmh: 'None.', social: 'Dropped out of college 8 months ago. Urine drug screen is negative for all substances, including THC and amphetamines.' },
        physicalExam: { neuro: 'Neurologic exam is non-focal.', others: 'Psychiatric exam: Disheveled appearance. Flat affect. Speech is tangential. He admits to hearing two voices conversing about his actions.' },
        labs: { chemistry: 'CBC, CMP, TSH, and VDRL are all within normal limits. Head CT is unremarkable.' }
      }
    },
    contentPrivate: {
      diagnosis: 'Schizophrenia',
      aliases: [],
      teachingPoints: [
        'Diagnosis of schizophrenia requires the presence of defining symptoms (delusions, hallucinations, disorganized speech, disorganized behavior, negative symptoms) for at least 6 months.',
        'Auditory hallucinations (often voices conversing) and bizarre delusions (thought broadcasting/insertion) are classic positive symptoms.',
        'The flat affect and social withdrawal represent negative symptoms.',
        'It is vital to rule out substance-induced psychosis or underlying medical conditions (like thyroid dysfunction), which are negative in this case.'
      ],
      answerCheck: {
        rationale: 'The patient exhibits classic positive (delusions, hallucinations) and negative (flat affect, withdrawal) symptoms persisting for over 6 months, after ruling out organic or substance-induced causes.',
        keyDifferentials: ['Schizophreniform Disorder', 'Substance-Induced Psychotic Disorder', 'Bipolar Disorder with Psychotic Features']
      }
    }
  },
  // 10. Infectious Disease
  {
    origin: 'curated',
    status: 'library_promoted',
    title: '30F with targetoid rash and fatigue',
    systemTags: ['Infectious Disease'],
    difficulty: 1,
    style: 'vignette',
    targetAudience: 'clinical',
    contentPublic: {
      layers: {
        presentationTimeline: 'Subacute (Weeks)',
        hpi: 'A 30-year-old female presents to her primary care physician out of concern for a rash. Two weeks ago, she went hiking in Connecticut. She now has a rash on her right thigh that has been slowly expanding over the past week. She also reports low-grade fevers, significant fatigue, and generalized muscle aches.',
        history: { pmh: 'None.', social: 'Avid hiker. Does not recall a tick bite.' },
        physicalExam: { general: 'Appears fatigued.', others: 'Skin exam reveals a 10cm annular erythematous lesion with central clearing (a "bullseye" appearance) on the posterior right thigh.' },
        labs: { others: 'Routine blood work is normal.' },
        pathognomonic: 'The clinical appearance of the rash is highly characteristic of erythema migrans.'
      }
    },
    contentPrivate: {
      diagnosis: 'Lyme Disease',
      aliases: ['Lyme Borreliosis', 'Erythema migrans'],
      teachingPoints: [
        'Lyme disease is caused by the spirochete Borrelia burgdorferi and is transmitted by Ixodes ticks, predominantly found in the Northeast US (like Connecticut).',
        'Erythema migrans (the targetoid or "bulls-eye" rash) is pathognomonic and sufficient for diagnosing early localized Lyme disease without serologic testing.',
        'The absence of a recalled tick bite does not rule out the disease, as the nymph ticks are very small.',
        'Doxycycline is the first-line treatment for early localized disease in adults.'
      ],
      answerCheck: {
        rationale: 'The classic presentation of an expanding "bulls-eye" rash (erythema migrans) in an endemic area after hiking is diagnostic for early localized Lyme disease.',
        keyDifferentials: ['Cellulitis', 'Tinea Corporis', 'Southern Tick-Associated Rash Illness (STARI)']
      }
    }
  }
];

async function seedV2() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Wipe existing cases in the library for a fresh seed
    await CaseDb.deleteMany({ origin: 'curated' });
    console.log('Cleared existing curated cases');

    const result = await CaseDb.insertMany(freeCases);
    console.log(`Successfully inserted ${result.length} curated free cases.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedV2();
