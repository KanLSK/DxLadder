/**
 * diagnosisSynonyms.ts
 * 
 * Static, zero-cost dictionary for diagnosis matching.
 * No DB calls, no AI calls — pure in-memory lookups.
 */

// ─── Token-level abbreviation → full form ───────────────────────────
// When a user types "MI", expand to "myocardial infarction" before matching.
// All keys MUST be lowercase.
export const abbreviationMap: Record<string, string> = {
  // Cardiology
  'mi': 'myocardial infarction',
  'ami': 'acute myocardial infarction',
  'stemi': 'st elevation myocardial infarction',
  'nstemi': 'non st elevation myocardial infarction',
  'chf': 'congestive heart failure',
  'hf': 'heart failure',
  'af': 'atrial fibrillation',
  'afib': 'atrial fibrillation',
  'svt': 'supraventricular tachycardia',
  'vt': 'ventricular tachycardia',
  'vf': 'ventricular fibrillation',
  'asd': 'atrial septal defect',
  'vsd': 'ventricular septal defect',
  'pda': 'patent ductus arteriosus',
  'mvp': 'mitral valve prolapse',
  'ie': 'infective endocarditis',
  'dcm': 'dilated cardiomyopathy',
  'hcm': 'hypertrophic cardiomyopathy',
  'aaa': 'abdominal aortic aneurysm',

  // Pulmonology
  'pe': 'pulmonary embolism',
  'copd': 'chronic obstructive pulmonary disease',
  'ards': 'acute respiratory distress syndrome',
  'tb': 'tuberculosis',
  'ild': 'interstitial lung disease',
  'ipf': 'idiopathic pulmonary fibrosis',
  'cf': 'cystic fibrosis',
  'cap': 'community acquired pneumonia',
  'hap': 'hospital acquired pneumonia',
  'vap': 'ventilator associated pneumonia',

  // Nephrology
  'ckd': 'chronic kidney disease',
  'aki': 'acute kidney injury',
  'arf': 'acute renal failure',
  'crf': 'chronic renal failure',
  'esrd': 'end stage renal disease',
  'uti': 'urinary tract infection',
  'rta': 'renal tubular acidosis',
  'atin': 'acute tubulointerstitial nephritis',
  'rpgn': 'rapidly progressive glomerulonephritis',
  'fsgs': 'focal segmental glomerulosclerosis',
  'mpgn': 'membranoproliferative glomerulonephritis',

  // Neurology
  'cva': 'cerebrovascular accident',
  'tia': 'transient ischemic attack',
  'sah': 'subarachnoid hemorrhage',
  'sdh': 'subdural hematoma',
  'edh': 'epidural hematoma',
  'gbs': 'guillain barre syndrome',
  'als': 'amyotrophic lateral sclerosis',
  'ms': 'multiple sclerosis',
  'nmo': 'neuromyelitis optica',
  'pml': 'progressive multifocal leukoencephalopathy',

  // GI / Hepatology
  'gerd': 'gastroesophageal reflux disease',
  'ibs': 'irritable bowel syndrome',
  'ibd': 'inflammatory bowel disease',
  'uc': 'ulcerative colitis',
  'cdiff': 'clostridioides difficile infection',
  'hcc': 'hepatocellular carcinoma',
  'psc': 'primary sclerosing cholangitis',
  'pbc': 'primary biliary cholangitis',
  'sbo': 'small bowel obstruction',
  'lbo': 'large bowel obstruction',
  'gi': 'gastrointestinal',
  'gib': 'gastrointestinal bleed',
  'ugib': 'upper gastrointestinal bleed',
  'lgib': 'lower gastrointestinal bleed',

  // Endocrine
  'dm': 'diabetes mellitus',
  'dka': 'diabetic ketoacidosis',
  'hhs': 'hyperosmolar hyperglycemic state',
  't1dm': 'type 1 diabetes mellitus',
  't2dm': 'type 2 diabetes mellitus',
  'pcos': 'polycystic ovary syndrome',
  'pheochromocytoma': 'pheochromocytoma',

  // Infectious
  'hiv': 'human immunodeficiency virus',
  'aids': 'acquired immunodeficiency syndrome',
  'mrsa': 'methicillin resistant staphylococcus aureus',
  'vre': 'vancomycin resistant enterococcus',
  'hbv': 'hepatitis b virus',
  'hcv': 'hepatitis c virus',
  'cmv': 'cytomegalovirus',
  'ebv': 'epstein barr virus',
  'hsv': 'herpes simplex virus',
  'vzv': 'varicella zoster virus',

  // Rheumatology
  'sle': 'systemic lupus erythematosus',
  'ra': 'rheumatoid arthritis',
  'oa': 'osteoarthritis',
  'as': 'ankylosing spondylitis',
  'psa': 'psoriatic arthritis',
  'gca': 'giant cell arteritis',
  'paan': 'polyarteritis nodosa',
  'gpa': 'granulomatosis with polyangiitis',
  'egpa': 'eosinophilic granulomatosis with polyangiitis',
  'mpa': 'microscopic polyangiitis',

  // Hematology / Oncology
  'dvt': 'deep vein thrombosis',
  'dic': 'disseminated intravascular coagulation',
  'itp': 'immune thrombocytopenic purpura',
  'ttp': 'thrombotic thrombocytopenic purpura',
  'hus': 'hemolytic uremic syndrome',
  'aml': 'acute myeloid leukemia',
  'all': 'acute lymphoblastic leukemia',
  'cml': 'chronic myeloid leukemia',
  'cll': 'chronic lymphocytic leukemia',
  'dlbcl': 'diffuse large b cell lymphoma',
  'hl': 'hodgkin lymphoma',
  'nhl': 'non hodgkin lymphoma',
  'mm': 'multiple myeloma',

  // Misc
  'acs': 'acute coronary syndrome',
  'nms': 'neuroleptic malignant syndrome',
  'ss': 'serotonin syndrome',
  'mds': 'myelodysplastic syndrome',
  'htn': 'hypertension',
  'bph': 'benign prostatic hyperplasia',
  'rcc': 'renal cell carcinoma',
  'nsclc': 'non small cell lung cancer',
  'sclc': 'small cell lung cancer',
};

// ─── Synonym groups ─────────────────────────────────────────────────
// Each group defines a canonical name and its equivalent variants.
// If a guess matches ANY variant, it's considered equivalent to the canonical.
export const synonymGroups: Array<{ canonical: string; variants: string[] }> = [
  {
    canonical: 'myocardial infarction',
    variants: ['heart attack', 'acute myocardial infarction', 'ami', 'stemi', 'nstemi', 'acute coronary syndrome'],
  },
  {
    canonical: 'cerebrovascular accident',
    variants: ['stroke', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke', 'cerebral infarction'],
  },
  {
    canonical: 'pulmonary embolism',
    variants: ['pulmonary thromboembolism', 'lung embolism', 'lung clot'],
  },
  {
    canonical: 'deep vein thrombosis',
    variants: ['dvt', 'deep venous thrombosis', 'leg clot'],
  },
  {
    canonical: 'congestive heart failure',
    variants: ['heart failure', 'chf', 'cardiac failure', 'left heart failure', 'right heart failure', 'biventricular heart failure'],
  },
  {
    canonical: 'chronic kidney disease',
    variants: ['chronic renal disease', 'chronic renal failure', 'chronic renal insufficiency', 'kidney failure'],
  },
  {
    canonical: 'acute kidney injury',
    variants: ['acute renal failure', 'acute renal injury', 'arf'],
  },
  {
    canonical: 'chronic obstructive pulmonary disease',
    variants: ['copd', 'chronic bronchitis', 'emphysema'],
  },
  {
    canonical: 'systemic lupus erythematosus',
    variants: ['lupus', 'sle'],
  },
  {
    canonical: 'diabetes mellitus',
    variants: ['diabetes', 'dm', 'sugar diabetes'],
  },
  {
    canonical: 'diabetic ketoacidosis',
    variants: ['dka'],
  },
  {
    canonical: 'guillain barre syndrome',
    variants: ['gbs', 'guillain barre', 'acute inflammatory demyelinating polyneuropathy', 'aidp'],
  },
  {
    canonical: 'pneumonia',
    variants: ['community acquired pneumonia', 'hospital acquired pneumonia', 'lobar pneumonia', 'bronchopneumonia', 'lung infection'],
  },
  {
    canonical: 'tuberculosis',
    variants: ['tb', 'pulmonary tb', 'pulmonary tuberculosis', 'mycobacterium tuberculosis'],
  },
  {
    canonical: 'infective endocarditis',
    variants: ['bacterial endocarditis', 'endocarditis', 'ie', 'subacute bacterial endocarditis', 'sbe'],
  },
  {
    canonical: 'appendicitis',
    variants: ['acute appendicitis'],
  },
  {
    canonical: 'cholecystitis',
    variants: ['acute cholecystitis', 'gallbladder inflammation'],
  },
  {
    canonical: 'pancreatitis',
    variants: ['acute pancreatitis', 'chronic pancreatitis'],
  },
  {
    canonical: 'meningitis',
    variants: ['bacterial meningitis', 'viral meningitis', 'aseptic meningitis'],
  },
  {
    canonical: 'pheochromocytoma',
    variants: ['pheo', 'paraganglioma', 'adrenal medullary tumor'],
  },
  {
    canonical: 'hyperthyroidism',
    variants: ['thyrotoxicosis', 'graves disease', 'toxic multinodular goiter', 'overactive thyroid'],
  },
  {
    canonical: 'hypothyroidism',
    variants: ['myxedema', 'hashimoto thyroiditis', 'underactive thyroid'],
  },
  {
    canonical: 'addison disease',
    variants: ['adrenal insufficiency', 'primary adrenal insufficiency', 'addisons disease', 'addisons'],
  },
  {
    canonical: 'cushing syndrome',
    variants: ['cushings syndrome', 'hypercortisolism', 'cushing disease', 'cushings disease'],
  },
  {
    canonical: 'aortic dissection',
    variants: ['dissecting aortic aneurysm', 'aortic tear'],
  },
  {
    canonical: 'urinary tract infection',
    variants: ['uti', 'bladder infection', 'cystitis', 'pyelonephritis', 'kidney infection'],
  },
  {
    canonical: 'atrial fibrillation',
    variants: ['afib', 'af', 'a fib'],
  },
  {
    canonical: 'multiple sclerosis',
    variants: ['ms', 'relapsing remitting ms', 'rrms'],
  },
  {
    canonical: 'rheumatoid arthritis',
    variants: ['ra'],
  },
  {
    canonical: 'ankylosing spondylitis',
    variants: ['as', 'ankylosing spondyloarthritis', 'axial spondyloarthritis'],
  },
  {
    canonical: 'acute respiratory distress syndrome',
    variants: ['ards'],
  },
  {
    canonical: 'disseminated intravascular coagulation',
    variants: ['dic', 'consumptive coagulopathy'],
  },
  {
    canonical: 'immune thrombocytopenic purpura',
    variants: ['itp', 'idiopathic thrombocytopenic purpura'],
  },
  {
    canonical: 'thrombotic thrombocytopenic purpura',
    variants: ['ttp'],
  },
  {
    canonical: 'hemolytic uremic syndrome',
    variants: ['hus'],
  },
  {
    canonical: 'nephrotic syndrome',
    variants: ['nephrosis'],
  },
  {
    canonical: 'nephritic syndrome',
    variants: ['glomerulonephritis', 'nephritis'],
  },
  {
    canonical: 'hepatocellular carcinoma',
    variants: ['hcc', 'liver cancer', 'hepatoma'],
  },
  {
    canonical: 'celiac disease',
    variants: ['celiac sprue', 'coeliac disease', 'gluten sensitive enteropathy'],
  },
  {
    canonical: 'inflammatory bowel disease',
    variants: ['ibd'],
  },
  {
    canonical: 'ulcerative colitis',
    variants: ['uc'],
  },
  {
    canonical: 'crohn disease',
    variants: ['crohns disease', 'crohns', 'regional enteritis'],
  },
  {
    canonical: 'iron deficiency anemia',
    variants: ['ida', 'iron deficiency anaemia'],
  },
  {
    canonical: 'sickle cell disease',
    variants: ['sickle cell anemia', 'sickle cell anaemia', 'scd'],
  },
  {
    canonical: 'pulmonary hypertension',
    variants: ['pah', 'pulmonary arterial hypertension'],
  },
  {
    canonical: 'acute porphyria',
    variants: ['acute intermittent porphyria', 'aip', 'porphyria'],
  },
];

// ─── Stop words ─────────────────────────────────────────────────────
// Removed during normalization to focus on clinically meaningful tokens.
export const stopWords = new Set<string>([
  'the', 'a', 'an', 'of', 'in', 'with', 'and', 'or', 'by', 'to', 'for',
  'on', 'at', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'type', 'stage', 'grade', 'form', 'due',
]);

// ─── Ambiguous abbreviations ────────────────────────────────────────
// These are TOO SHORT and can mean multiple diagnoses.
// Rejected by default unless explicitly allowed per case via acceptRules.
export const ambiguousAbbrevs = new Set<string>([
  'ms',   // Multiple Sclerosis OR Mitral Stenosis OR Morphine Sulfate
  'ca',   // Cancer OR Calcium OR Cardiac Arrest
  'hf',   // Heart Failure OR Hemorrhagic Fever OR Hemophilia (rare)
  'pe',   // Pulmonary Embolism OR Pleural Effusion OR Physical Exam
  'as',   // Aortic Stenosis OR Ankylosing Spondylitis
  'af',   // Atrial Fibrillation OR Atrial Flutter
  'ra',   // Rheumatoid Arthritis OR Right Atrium
  'oa',   // Osteoarthritis OR Oxaloacetate
  'dm',   // Diabetes Mellitus OR Dermatomyositis
  'cf',   // Cystic Fibrosis OR Cardiac Failure
  'uc',   // Ulcerative Colitis OR Urothelial Carcinoma
  'mm',   // Multiple Myeloma OR Malignant Melanoma
  'hl',   // Hodgkin Lymphoma OR Hearing Loss
  'ss',   // Serotonin Syndrome OR Sjogren Syndrome
  'gi',   // Gastrointestinal (too generic)
]);
