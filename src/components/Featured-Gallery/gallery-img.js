import importAll from "../../utils/imageImporter";

const imageContext = require.context(
  "../../assets/images",
  false,
  /\.(png|jpe?g|svg)$/
);
const importedImages = importAll(imageContext);

export const images = importedImages.map((src, index) => ({
  itemImageSrc: src,
  thumbnailImageSrc: src, // Using the same image for thumbnail
  alt: `Gallery image ${index + 1} - ${src
    .split("/")
    .pop()
    .split(".")[0]
    .replace(/_/g, " ")}`,
  title: `Image ${index + 1}`
}));