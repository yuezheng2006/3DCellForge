#!/bin/bash

# Generate front and side views for each car model

CARS=(
  "Porsche 911 Turbo S:porsche-911-turbo-s"
  "Mercedes-AMG G 63:mercedes-amg-g63"
  "Tesla Model S Plaid:tesla-model-s-plaid"
  "Ford F-150 Raptor:ford-f150-raptor"
  "Toyota GR Supra:toyota-gr-supra"
  "BMW i8 Roadster:bmw-i8-roadster"
  "Dodge Challenger SRT Hellcat:dodge-challenger-hellcat"
)

OUTPUT_DIR="public/generated-models/car-reference-images"

for car_entry in "${CARS[@]}"; do
  IFS=':' read -r car_name filename <<< "$car_entry"

  echo "Generating views for: $car_name"

  # Front view
  codex exec "Generate a photorealistic front view image of a $car_name. Studio lighting, professional automotive photography, 3/4 front angle showing the front grille and headlights clearly. Clean white background. High resolution, sharp details. Save as ${OUTPUT_DIR}/${filename}-front.png"

  # Side view
  codex exec "Generate a photorealistic side profile view of a $car_name. Studio lighting, professional automotive photography, perfect 90-degree side angle showing the full profile from wheel to wheel. Clean white background. High resolution, sharp details. Save as ${OUTPUT_DIR}/${filename}-side.png"

  echo "Completed: $car_name"
  echo "---"
done

echo "All car views generated!"
