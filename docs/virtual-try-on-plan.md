# Plan: AI virtual try-on for "Fit for your look"

This plan follows PRD.md. The PRD lists AI virtual try-on as a v2 item (PRD line 255 and line 257). The PRD calls it the largest v2 build. This plan keeps the build small on purpose.

## 1. Purpose

Show the customer one wig on their own photo. Keep the current recommender for the other wigs. Help the customer choose with more confidence. Reduce returns.

## 2. Scope

### The system does this

1. The customer uploads one face photo.
2. The AI stylist reads the face shape, the complexion, and the good length.
3. The AI stylist selects the best wig from the full catalogue.
4. The system makes one preview image. The preview shows the best wig on the customer photo.
5. The system shows 2 or 3 more wigs as recommendation cards. These cards use the current flow.

### The system does not do this

1. The system does not put more than one wig on the photo.
2. The system does not make a "next" preview for each wig.
3. The system does not use live camera or AR.
4. The system does not store the customer photo.
5. The system does not store the preview image.

## 3. How it works (flow)

1. The customer opens "Fit for your look".
2. The customer uploads one clear, front-facing photo.
3. The browser makes the photo smaller. The browser sends the photo to the server.
4. The server sends the photo and the catalogue to the AI stylist.
5. The AI stylist returns the face shape, a summary, and the ranked wigs.
6. The server makes one preview image for the top wig.
7. The server returns the preview, the summary, and the recommendation cards.
8. The page shows the preview at the top. The page shows the cards below.
9. If the preview fails, the page shows the recommendation cards only.

## 4. Technical approach

The system must keep the hair true to the real wig. The system must keep the face and the complexion true to the customer.

1. Use masked edit (inpainting). Change only the hair area. Keep the face pixels.
2. Send the real wig photo as a reference. Keep the color, the texture, and the length of the real wig.
3. Use medium image quality. Do not use low quality.
4. Do not change the customer skin tone. The masked edit keeps the skin tone.

## 5. Honest recommendation rules

The recommendation must be honest. The recommendation must not favour best-sellers.

1. The AI stylist reads the full live catalogue.
2. The AI stylist matches the wig to the face shape, the complexion, and the length.
3. Asset preparation does not change the recommendation. A cut-out only makes the preview sharper.
4. The catalogue data includes the colorway and the length. The AI stylist uses this data for the match.

## 6. Quality risk control

A bad preview hurts the brand. Control the risk before launch.

1. Build the preview first.
2. Test the preview on 3 to 5 real photos. Use different face shapes and complexions.
3. Launch only if the quality is good on the brand.
4. If the quality is not good, do not launch. Use the specialist service instead (see section 11).
5. Show the label "AI preview — actual unit may vary" on each preview.

## 7. Cost

The recommender is cheap. The preview image is not cheap.

1. The face analysis costs about $0.01 to $0.02 for each customer.
2. One medium preview image costs about $0.07 to $0.19.
3. The total cost is about $0.08 to $0.20 for each customer.
4. A $5 balance covers about 25 to 60 customers.
5. The founder must add credit as use grows.
6. One image for each customer keeps the cost predictable.

## 8. Data and privacy

1. The system sends the photo to the AI provider (OpenAI).
2. The system uses the photo only for this suggestion.
3. YBBeautylounge does not save the photo.
4. YBBeautylounge does not save the preview.
5. The page tells the customer that the photo goes to the AI stylist.

## 9. Assets from the founder

1. Send 3 to 5 sample face photos for the test. Use different complexions and face shapes.
2. Send 2 or 3 real wig photos for the test.
3. Later, add a clean cut-out for each wig. A cut-out gives a sharper preview.
4. A cut-out is not required for launch. A cut-out does not change the recommendation.

## 10. Build steps

1. Confirm the image model. Confirm that the model supports masked edit. (Default: OpenAI `gpt-image-1`.)
2. Add a server step that makes one preview image.
3. Add face-lock (masked edit) and the wig reference.
4. Improve the analysis. Add the complexion and the length to the match.
5. Update the page. Show the preview at the top. Keep the cards below.
6. Add the fallback. Show the cards only if the preview fails.
7. Add the "AI preview" label.
8. Test on the sample photos. Show the results to the founder.
9. Launch only after the founder approves the quality.

## 11. Fallback plan

If the general image model is not good enough:

1. Do not launch the general model.
2. Research a specialist wig try-on service.
3. Bring the founder the service names, the quality, and the price.
4. The founder decides the next step.

## 12. Open decisions

1. Which image model? (Default: OpenAI `gpt-image-1`.)
2. Is the founder happy with $0.08 to $0.20 for each customer?
3. When will the founder send the test photos and the wig photos?
