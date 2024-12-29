(function () {
    console.log("API requests are being observed");
    let originalXHR = XMLHttpRequest.prototype.send;
  
    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("load", function () {
        if (this.responseURL.includes("problems") && this.status === 200) {
          const responseData = JSON.parse(this.responseText);
          if(responseData.data){
            const customEvent = new CustomEvent("problem_details_event", {
              detail: {
                problem: responseData.data.body,
                constraints: responseData.data.constraints,
                hints: responseData.data.hints,
                input_format: responseData.data.input_format,
                output_format: responseData.data.output_format,
                note: responseData.data.note,
                samples: responseData.data.samples,
                title: responseData.data.title,
                id: responseData.data.id,
              },
            });
            window.dispatchEvent(customEvent);
          }
        }
  
        if (this.responseURL.includes("profile") && this.status === 200) {
          const responseData = JSON.parse(this.responseText);
          if(responseData.data.id){
            const customEvent = new CustomEvent("user_id_event", {
              detail: {
                id: responseData.data.id,
              },
            });
            window.dispatchEvent(customEvent);
          }
        }
      });
      originalXHR.apply(this, args);
    };
  })();
  
