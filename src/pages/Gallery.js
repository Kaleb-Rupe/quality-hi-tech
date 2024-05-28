import React from "react";
import assets from '../assets'


const Image = () => {
  for(let i = 0; i < assets.length; i++){
    return i;
  }
}; 

const Gallery = () => {
  return (
    <>
      <h1>Gallery Page</h1>
      <p>Welcome to the gallery page!</p>
      <img src={Image} />
    </>
  );
};

export default Gallery;

