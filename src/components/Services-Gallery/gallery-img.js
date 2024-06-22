import importAll from "../../utils/imageImporter";

const imageContext = require.context(
  "../../assets/images",
  false,
  /\.(png|jpe?g|svg)$/
);
const importedImages = importAll(imageContext);

export const images = importedImages.map((src, index) => ({
  id: index + 1,
  src,
  alt: `Gallery image ${index + 1}`,
}));
