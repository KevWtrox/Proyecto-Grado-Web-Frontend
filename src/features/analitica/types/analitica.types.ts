// Tipos del módulo de Analítica CNN — espejo de los schemas Pydantic de
// `Proyecto-Grado-Excercises-Backend/app/schemas/analitica.py` y de
// `Proyecto-Grado-Audio-Backend/app/schemas/analytics_schemas.py`.

export interface TrainingHyperparams {
  optimizer: string;
  learning_rate_head: number;
  learning_rate_finetune: number;
  weight_decay: number;
  batch_size: number;
  epochs_phase1: number;
  epochs_phase2: number;
  loss_function: string;
  label_smoothing: number;
  early_stopping_patience: number;
  lr_scheduler: string;
  data_augmentation: string[];
}

export interface ModelArchitectureInfo {
  name: string;
  paper: string;
  backbone_params: number;
  total_params: number;
  trainable_params: number;
  non_trainable_params: number;
  flops_g: number;
  input_shape: [number, number, number];
  output_classes: number;
  compound_alpha: number;
  compound_beta: number;
  compound_gamma: number;
  compound_phi: number;
  num_mbconv_blocks: number;
  activation: string;
  final_pooling: string;
  classifier_head: string[];
  pretrained_on: string;
  fine_tuned_on: string;
  training_hyperparams: TrainingHyperparams;
}

export interface NSynthDatasetInfo {
  name: string;
  publisher: string;
  paper: string;
  total_notes: number;
  unique_instruments: number;
  pitch_classes_midi: number;
  sample_rate_hz: number;
  note_duration_s: number;
  instrument_families: string[];
  train_split: number;
  valid_split: number;
  test_split: number;
  filtered_for_solfeo: number;
  pitch_range_used: string;
}

export interface PreprocessingParams {
  sample_rate: number;
  n_fft: number;
  hop_length: number;
  n_mels: number;
  fmin_hz: number;
  fmax_hz: number;
  window_type: string;
  img_width: number;
  img_height: number;
  bandpass_low_hz: number;
  bandpass_high_hz: number;
  bandpass_order: number;
  bandpass_type: string;
  apply_hpss: boolean;
  hpss_margin: number;
  noise_reduction_method: string;
  noise_prop_decrease: number;
  pre_emphasis_coef: number;
  normalization_mean: [number, number, number];
  normalization_std: [number, number, number];
  log_epsilon: number;
}

export interface SpectralFeatures {
  centroid_hz: number;
  rolloff_85_hz: number;
  bandwidth_hz: number;
  zero_crossing_rate: number;
  rms_energy: number;
  flatness: number;
  mel_band_energies: number[];
  dominant_freq_hz: number;
  snr_db: number;
}

export interface LayerActivation {
  stage: number;
  name: string;
  block_type: string;
  input_shape: [number, number, number];
  output_shape: [number, number, number];
  expansion_ratio: number;
  kernel_size: number;
  stride: number;
  se_ratio: number;
  params: number;
  flops_m: number;
  activation_norm_l2: number;
}

export interface ForwardPassReport {
  inference_time_ms: number;
  gpu_memory_mb: number;
  cpu_memory_mb: number;
  batch_size: number;
  framework: string;
  device: string;
  precision: string;
  total_flops_g: number;
  feature_vector_dim: number;
}

export interface GradCAMRegion {
  rank: number;
  activation: number;
  freq_band_hz_low: number;
  freq_band_hz_high: number;
  time_start_ms: number;
  time_end_ms: number;
  interpretation: string;
}

export interface GradCAMReport {
  heatmap_7x7: number[][];
  per_note_heatmaps: number[][][];
  per_note_resolution: number;
  target_class: string;
  target_class_index: number;
  top_regions: GradCAMRegion[];
  method: string;
  target_layer: string;
}

export interface Top5Prediction {
  note: string;
  pitch_class: string;
  logit: number;
  probability: number;
}

export interface NoteAnalysis {
  position_index: number;
  nota_objetivo: string;
  nota_predicha: string;
  pitch_class_objetivo: string;
  pitch_class_objetivo_idx: number;
  pitch_class_predicha: string;
  pitch_class_predicha_idx: number;
  logits_12: number[];
  softmax_12: number[];
  top5: Top5Prediction[];
  confianza: number;
  entropia: number;
  freq_detectada_hz: number;
  freq_esperada_hz: number;
  cents_deviation: number;
  onset_ms: number;
  duracion_ms: number;
  correcta: boolean;
  cross_entropy_loss: number;
}

export interface SpectrogramAnalysis {
  spec_id: string;
  resultado_id?: string;
  estudiante_id?: string;
  ejercicio_id?: string;
  bpm_usado?: number;
  calidad_grabacion: number;
  precision_porcentaje: number;
  puntuacion: number;
  preprocessing_params: PreprocessingParams;
  spectral_features: SpectralFeatures;
  layer_activations: LayerActivation[];
  forward_pass: ForwardPassReport;
  grad_cam: GradCAMReport;
  notes: NoteAnalysis[];
  aggregate_top1_accuracy: number;
  aggregate_top5_accuracy: number;
  aggregate_cross_entropy: number;
  aggregate_confidence_mean: number;
  spectrogram_image_url?: string | null;
  spectrogram_image_base64?: string | null;
}

// ── Lado exercises backend ──────────────────────────────────────────────

export interface ResumenIntentoCNN {
  resultado_id: string;
  numero_intento: number;
  fecha_intento: string;
  puntuacion: number;
  precision_porcentaje: number;
  duracion_segundos: number;
  aprobado: boolean;
  audio_url: string | null;
  notas_detectadas: string[] | null;
  bpm_detectado: number | null;
  calidad_grabacion: number | null;
  retroalimentacion: Record<string, unknown>;
  cnn_top1_accuracy: number;
  cnn_top5_accuracy: number;
  cnn_loss_promedio: number;
  cnn_confianza_promedio: number;
  cnn_ece: number;
  cnn_tiempo_inferencia_ms: number;
}

export interface EjercicioConAnalisisCNN {
  ejercicio_id: string;
  titulo: string;
  tipo: string;
  categoria_id: string;
  bpm_referencia: number;
  compas: string;
  total_intentos: number;
  mejor_puntuacion: number;
  aprobado: boolean;
  notas_esperadas: string[];
  intentos: ResumenIntentoCNN[];
}

export interface EjerciciosEstudianteCNNResponse {
  estudiante_id: string;
  total_ejercicios: number;
  ejercicios: EjercicioConAnalisisCNN[];
}

export interface MatrizConfusionResponse {
  estudiante_id: string;
  labels: string[];
  matrix: number[][];
  total_muestras: number;
  accuracy_global: number;
  diagonal_dominance: number;
  celdas_no_cero: number;
}

export interface ParConfundido {
  pc_real: string;
  pc_predicha: string;
  ocurrencias: number;
  distancia_semitonos: number;
}

export interface MetricasEstudianteCNN {
  estudiante_id: string;
  total_muestras: number;
  top1_accuracy: number;
  top5_accuracy: number;
  f1_macro: number;
  f1_weighted: number;
  ece_promedio: number;
  cross_entropy_promedio: number;
  precision_por_clase: Record<string, number>;
  recall_por_clase: Record<string, number>;
  f1_por_clase: Record<string, number>;
  pares_mas_confundidos: ParConfundido[];
}

export interface PuntoCurvaAprendizaje {
  numero_intento: number;
  fecha_intento: string;
  loss: number;
  accuracy: number;
  confianza_promedio: number;
}

export interface CurvaAprendizajeResponse {
  estudiante_id: string;
  total_intentos: number;
  puntos: PuntoCurvaAprendizaje[];
}

export interface AnalisisResultadoCompleto {
  resultado_id: string;
  estudiante_id: string;
  ejercicio_id: string;
  titulo_ejercicio: string;
  tipo_ejercicio: string;
  bpm_referencia: number;
  compas: string;
  fecha_intento: string;
  puntuacion: number;
  precision_porcentaje: number;
  duracion_segundos: number;
  aprobado: boolean;
  numero_intento: number;
  notas_esperadas: string[];
  notas_detectadas: string[];
  audio_url: string | null;
  retroalimentacion: Record<string, unknown>;
  cnn_report: SpectrogramAnalysis;
}

export interface ResumenAnaliticaGlobal {
  total_estudiantes_con_intentos: number;
  total_intentos: number;
  total_ejercicios_evaluados: number;
  accuracy_promedio_top1: number;
  confianza_promedio: number;
  intentos_por_tipo: Record<string, number>;
}
