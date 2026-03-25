import React from 'react';

const AboutSection = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold mb-6 text-primary">About Our Canteen</h1>
      <p className="text-lg text-gray-700 leading-relaxed">
        At <strong>Laikipia Canteen</strong>, we believe in fueling student success with fresh, 
        flavorful, and affordable meals. Our mission is to provide a seamless dining experience 
        that fits into your busy campus schedule. Whether you're grabbing a quick snack between 
        lectures or sitting down for a full meal — we've got you covered!
      </p>
      <p className="mt-6 text-gray-600 italic">
        We are committed to the highest standards of hygiene and using the finest local ingredients. 
        Thank you for choosing us to be part of your university journey!
      </p>
    </div>
  );
};

export default AboutSection;