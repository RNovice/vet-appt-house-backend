const axios = require("axios");
const fs = require("fs");

// Unsplash API Configuration
const ACCESS_KEY = "your_unsplash_access_key"; // Replace with your Unsplash API access key
const BASE_URL = "https://api.unsplash.com/search/photos";
const QUERY = "veterinary clinic";
const PER_PAGE = 30; // Maximum allowed by Unsplash API
const TOTAL_IMAGES = 1500; // Maximum 1500
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second in milliseconds

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch Image URLs
async function fetchImageUrls() {
  let imageUrls = [];
  const totalPages = Math.ceil(TOTAL_IMAGES / PER_PAGE);

  console.log(`Fetching ${TOTAL_IMAGES} images...`);

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}...`);

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          query: QUERY,
          page: page,
          per_page: PER_PAGE,
          client_id: ACCESS_KEY,
        },
      });

      const results = response.data.results;

      // Extract image URLs and add them to the array
      results.forEach((result) => {
        if (result.urls && result.urls.regular) {
          imageUrls.push(result.urls.regular);
        }
      });

      console.log(`Page ${page}: ${results.length} images fetched.`);
    } catch (error) {
      console.error(
        `Error fetching page ${page}:`,
        error.response ? error.response.data : error.message
      );
    }

    // Stop if we’ve reached the required number of images
    if (imageUrls.length >= TOTAL_IMAGES) break;

    // Delay to avoid hitting the rate limit
    await delay(DELAY_BETWEEN_REQUESTS);
  }

  return imageUrls.slice(0, TOTAL_IMAGES);
}

// Save Image URLs to a File
async function saveImageUrls() {
  const imageUrls = await fetchImageUrls();

  fs.writeFile("vet_img_urls.txt", imageUrls.join("\n"), (err) => {
    if (err) {
      console.error("Error saving image URLs:", err);
    } else {
      console.log(`Saved ${imageUrls.length} image URLs to 'vet_img_urls.txt'.`);
    }
  });
}

// Start the script
saveImageUrls();
