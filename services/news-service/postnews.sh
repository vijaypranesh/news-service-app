#!/bin/bash

URL="http://localhost:4000/news"

declare -a news=(
  "Tech Update #1|Summary of tech update number 1.|2025-07-27T22:37:35.814Z"
  "Tech Update #2|Summary of tech update number 2.|2025-07-27T22:38:35.814Z"
  "Tech Update #3|Summary of tech update number 3.|2025-07-27T22:39:35.814Z"
  "Tech Update #4|Summary of tech update number 4.|2025-07-27T22:40:35.814Z"
  "Tech Update #5|Summary of tech update number 5.|2025-07-27T22:41:35.814Z"
  "Tech Update #6|Summary of tech update number 6.|2025-07-27T22:42:35.814Z"
  "Tech Update #7|Summary of tech update number 7.|2025-07-27T22:43:35.814Z"
  "Tech Update #8|Summary of tech update number 8.|2025-07-27T22:44:35.814Z"
  "Tech Update #9|Summary of tech update number 9.|2025-07-27T22:45:35.814Z"
  "Tech Update #10|Summary of tech update number 10.|2025-07-27T22:46:35.814Z"
)

for item in "${news[@]}"
do
  IFS="|" read -r title summary timestamp <<< "$item"

  curl -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"$title\", \"summary\": \"$summary\", \"timestamp\": \"$timestamp\"}"

  echo -e "\nPosted: $title"
done
