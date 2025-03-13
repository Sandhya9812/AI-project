document.addEventListener("DOMContentLoaded", function () {
  let prompt = document.querySelector("#prompt");
  let chatContainer = document.querySelector(".chat-container");
  let imageBtn = document.querySelector("#image");
  let imageInput = document.querySelector("#image input");
  let submitBtn = document.querySelector("#submit");

  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB7q1vPtsHFso7F_OxEn4v5pvG9iUHa02Y";

  let user = {
      message: null,
      file: {
          mime_type: null,
          data: null,
      },
  };

  function createChatBox(html, classes) {
      let div = document.createElement("div");
      div.innerHTML = html;
      div.classList.add(...classes.split(" "));
      return div;
  }

  async function generateResponse(aiChatBox, userMessage, userFile) {
      let parts = [{ text: userMessage }];
      if (userFile.data) {
          parts.push({
              inline_data: {
                  mime_type: userFile.mime_type,
                  data: userFile.data,
              },
          });
      }

      let requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
      };

      try {
          let response = await fetch(API_URL, requestOptions);
          let data = await response.json();

          console.log("API Response:", data);

          let aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
          aiChatBox.querySelector(".Ai-chat-area").innerHTML = aiMessage;
          chatContainer.scrollTop = chatContainer.scrollHeight;
          prompt.disabled = false;
      } catch (error) {
          console.error("Error fetching AI response:", error);
          aiChatBox.querySelector(".Ai-chat-area").innerHTML = "Error: Unable to get a response.";
          prompt.disabled = false;
      }
  }

  function handleChatResponse() {
      let message = prompt.value.trim();
      if (!message && !user.file.data) return;

      prompt.disabled = true;

      let userHtml = `
          <div class="user-chat-box">
              <img src="girl.png" alt="User" class="chat-avatar chat-avatar-small">
              <div class="user-chat-content">
                  <div class="user-chat-area">${message || "📷 Sent an image"}</div>
                  ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" alt="User Image" class="chat-image">` : ""}
              </div>
          </div>
      `;
      let userChatBox = createChatBox(userHtml, "user-chat-box");
      chatContainer.appendChild(userChatBox);

      prompt.value = "";
      imageInput.value = "";
      chatContainer.scrollTop = chatContainer.scrollHeight;

      let aiHtml = `
          <div class="Ai-chat-box">
              <img src="robot-2.webp" alt="AI" class="chat-avatar chat-avatar-small">
              <div class="Ai-chat-area">
                  <img src="loader.webp" alt="Loading..." class="load" width="30px">
              </div>
          </div>
      `;
      let aiChatBox = createChatBox(aiHtml, "Ai-chat-box");
      chatContainer.appendChild(aiChatBox);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      generateResponse(aiChatBox, message, user.file);
  }

  prompt.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          handleChatResponse();
      }
  });

  submitBtn.addEventListener("click", handleChatResponse);

  imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;

      let reader = new FileReader();
      reader.onload = (e) => {
          let base64string = e.target.result.split(",")[1];
          user.file = {
              mime_type: file.type,
              data: base64string,
          };
      };
      reader.readAsDataURL(file);
  });

  imageBtn.addEventListener("click", () => {
      imageInput.click();
  });
});
