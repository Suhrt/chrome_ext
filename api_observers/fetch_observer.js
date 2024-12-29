(function () {
    console.log("Fetch response interceptor initialized");
  
    const originalFetch = window.fetch; // Save the original fetch function
  
    // Overriding fetch
    window.fetch = async (...args) => {
  
      // Call the original fetch function and wait for the response
      const response = await originalFetch(...args);
  
      // Clone the response to avoid consuming it
      const clonedResponse = response.clone();
  
      // Check URL and response status      
      if (response.url.includes("problems") && response.ok) {
        clonedResponse.text().then((body) => {
          console.log("Fetch response body:", body);
        });
      }

      if (response.url.includes("profile") && response.ok) {
        clonedResponse.text().then((body) => {
          console.log("Fetch response body:", body);
        });
      }
  
      // Return the original response
      return response;
    };
  
  })();  