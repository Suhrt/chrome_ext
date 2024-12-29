const maxRetries = 10;


let userId = "";
let currentProblem = {};
let retryCount = 0;
let aiKey = "";
let chatHistory = [];


// function to observe URL changes
(function () {
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            init();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    //  Listen for popstate (browser back/forward)
    window.addEventListener("popstate", () => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            init();
        }
    });

    // listen for page reload
    window.addEventListener("load", () => {
        init();
    });
})();


// capture events from background script
(function () {

    window.addEventListener("user_id_event", function (customEvent) {
        userId = customEvent.detail.message;
    });

    window.addEventListener("problem_details_event", function (customEvent) {
        let data = customEvent.detail;
        currentProblem.problem = data.problem;
        currentProblem.constraints = data.constraints;
        currentProblem.hints = data.hints;
        currentProblem.input_format = data.input_format;
        currentProblem.output_format = data.output_format;
        currentProblem.note = data.note;
        currentProblem.samples = data.samples;
        currentProblem.title = data.title;
        currentProblem.id = data.id;
    });

})();

function init() {
    appendAIButton();
    loadAiKey();
}

// insert a new button just befre the ask doubt button, in the same style
function appendAIButton() {
    //check if button already exists
    if (document.getElementById('ai_button')) {
        return;
    }

    const askDoubtBtn = Array.from(document.querySelectorAll('button')).find((button) =>
        Array.from(button.classList).some((cls) => cls.startsWith('coding_ask_doubt_button'))
    );

    //if btn is not found exponetially increase the timeout
    if (askDoubtBtn === undefined) {
        if (retryCount >= maxRetries) {
            console.error("Max retries reached. Button not found.");
            return;
        }
        const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        setTimeout(appendAIButton, timeout);
    }

    const aiButton = document.createElement('button');
    aiButton.classList = askDoubtBtn.classList;
    aiButton.style.marginRight = '10px';
    aiButton.style.height = '41.4px';
    aiButton.id = 'ai_button';
    aiButton.onmouseover = function () {
        document.getElementById('ai_svg').style.display = 'none';
    };

    aiButton.onmouseout = function () {
        document.getElementById('ai_svg').style.display = 'block';
    };

    aiButton.onclick = function () {
        if (aiKey == null || aiKey == "") {
            askApiKey();
            return;
        }

        addChatUi();
    };

    const svgString = `<div id="ai_svg"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"  width="20px" height="20px" stroke="currentColor" stroke-width="0">
<path fill="currentColor" d="M0 0 C0.81597656 -0.020625 1.63195312 -0.04125 2.47265625 -0.0625 C8.47500863 -0.10166706 8.47500863 -0.10166706 11.6953125 1.640625 C13.125 3.25 13.125 3.25 13.125 5.25 C13.888125 5.4975 14.65125 5.745 15.4375 6 C18.47763637 7.41401692 19.40912299 8.41202444 21.125 11.25 C21.46557617 13.63183594 21.46557617 13.63183594 21.41796875 16.234375 C21.4034668 17.63623047 21.4034668 17.63623047 21.38867188 19.06640625 C21.36353516 20.03449219 21.33839844 21.00257812 21.3125 22 C21.29219727 23.47533203 21.29219727 23.47533203 21.27148438 24.98046875 C21.23618726 27.40420415 21.18688054 29.82682145 21.125 32.25 C20.135 32.58 19.145 32.91 18.125 33.25 C18.186875 34.36375 18.24875 35.4775 18.3125 36.625 C18.2196875 38.419375 18.2196875 38.419375 18.125 40.25 C15.125 42.25 15.125 42.25 11.125 42.25 C10.795 43.24 10.465 44.23 10.125 45.25 C6.98097519 46.8220124 3.63552603 46.43446744 0.1875 46.4375 C-0.54146484 46.44974609 -1.27042969 46.46199219 -2.02148438 46.47460938 C-5.8463391 46.48512685 -7.61856564 46.42095624 -10.875 44.25 C-10.875 43.59 -10.875 42.93 -10.875 42.25 C-11.679375 42.105625 -12.48375 41.96125 -13.3125 41.8125 C-15.875 41.25 -15.875 41.25 -16.875 40.25 C-16.91592937 37.91702567 -16.91741723 35.58294775 -16.875 33.25 C-18.195 32.59 -19.515 31.93 -20.875 31.25 C-20.9625127 28.02100574 -21.01556146 24.79231884 -21.0625 21.5625 C-21.08763672 20.65048828 -21.11277344 19.73847656 -21.13867188 18.79882812 C-21.19304408 13.81470926 -21.22752034 10.25191895 -17.875 6.25 C-15.875 5.125 -15.875 5.125 -13.875 4.25 C-12.8555881 3.26979625 -11.85253644 2.27196992 -10.875 1.25 C-7.49648271 -0.43925865 -3.71213354 0.02323714 0 0 Z M-10.875 5.25 C-10.875 5.91 -10.875 6.57 -10.875 7.25 C-11.65875 7.518125 -12.4425 7.78625 -13.25 8.0625 C-16.15614923 9.09814432 -16.15614923 9.09814432 -17.875 12.25 C-18.11555468 14.30709596 -18.11555468 14.30709596 -18 16.4375 C-17.95875 17.695625 -17.9175 18.95375 -17.875 20.25 C-16.555 20.58 -15.235 20.91 -13.875 21.25 C-13.875 20.59 -13.875 19.93 -13.875 19.25 C-11.895 19.25 -9.915 19.25 -7.875 19.25 C-7.875 21.23 -7.875 23.21 -7.875 25.25 C-9.855 25.25 -11.835 25.25 -13.875 25.25 C-13.875 24.59 -13.875 23.93 -13.875 23.25 C-15.195 23.58 -16.515 23.91 -17.875 24.25 C-18.20925735 26.62374861 -18.20925735 26.62374861 -17.875 29.25 C-17.215 29.724375 -16.555 30.19875 -15.875 30.6875 C-15.215 31.203125 -14.555 31.71875 -13.875 32.25 C-13.625 35.4375 -13.625 35.4375 -13.875 38.25 C-12.905625 38.518125 -11.93625 38.78625 -10.9375 39.0625 C-9.926875 39.454375 -8.91625 39.84625 -7.875 40.25 C-7.545 41.24 -7.215 42.23 -6.875 43.25 C-5.225 43.25 -3.575 43.25 -1.875 43.25 C-0.43292059 40.36584117 -0.78105113 37.83278472 -0.8125 34.625 C-0.82152344 33.43648437 -0.83054687 32.24796875 -0.83984375 31.0234375 C-0.85144531 30.10820312 -0.86304687 29.19296875 -0.875 28.25 C-2.525 28.25 -4.175 28.25 -5.875 28.25 C-5.875 29.57 -5.875 30.89 -5.875 32.25 C-5.215 32.25 -4.555 32.25 -3.875 32.25 C-3.875 34.23 -3.875 36.21 -3.875 38.25 C-5.855 38.25 -7.835 38.25 -9.875 38.25 C-9.875 36.27 -9.875 34.29 -9.875 32.25 C-9.215 32.25 -8.555 32.25 -7.875 32.25 C-7.875 30.27 -7.875 28.29 -7.875 26.25 C-5.565 26.25 -3.255 26.25 -0.875 26.25 C-0.875 23.61 -0.875 20.97 -0.875 18.25 C-2.525 18.25 -4.175 18.25 -5.875 18.25 C-5.875 16.6 -5.875 14.95 -5.875 13.25 C-6.535 13.25 -7.195 13.25 -7.875 13.25 C-7.875 13.91 -7.875 14.57 -7.875 15.25 C-9.855 15.25 -11.835 15.25 -13.875 15.25 C-13.875 13.27 -13.875 11.29 -13.875 9.25 C-11.895 9.25 -9.915 9.25 -7.875 9.25 C-7.875 9.91 -7.875 10.57 -7.875 11.25 C-6.555 11.25 -5.235 11.25 -3.875 11.25 C-3.875 12.9 -3.875 14.55 -3.875 16.25 C-2.885 16.25 -1.895 16.25 -0.875 16.25 C-0.84791433 14.64592672 -0.82856517 13.0417215 -0.8125 11.4375 C-0.80089844 10.54417969 -0.78929688 9.65085937 -0.77734375 8.73046875 C-0.76490033 6.11586209 -0.76490033 6.11586209 -1.875 3.25 C-6.6647321 3.01571687 -6.6647321 3.01571687 -10.875 5.25 Z M2.125 3.25 C1.795 5.89 1.465 8.53 1.125 11.25 C3.765 11.25 6.405 11.25 9.125 11.25 C9.125 10.59 9.125 9.93 9.125 9.25 C10.775 9.25 12.425 9.25 14.125 9.25 C13.50625 9.0025 12.8875 8.755 12.25 8.5 C9.77431313 7.04371361 9.17374998 5.87187494 8.125 3.25 C6.145 3.25 4.165 3.25 2.125 3.25 Z M15.125 10.25 C15.125 11.9 15.125 13.55 15.125 15.25 C13.145 15.25 11.165 15.25 9.125 15.25 C9.125 14.59 9.125 13.93 9.125 13.25 C6.485 13.25 3.845 13.25 1.125 13.25 C1.125 20.18 1.125 27.11 1.125 34.25 C2.445 34.25 3.765 34.25 5.125 34.25 C5.125 33.59 5.125 32.93 5.125 32.25 C7.105 32.25 9.085 32.25 11.125 32.25 C11.125 34.23 11.125 36.21 11.125 38.25 C9.145 38.25 7.165 38.25 5.125 38.25 C5.125 37.59 5.125 36.93 5.125 36.25 C3.805 36.25 2.485 36.25 1.125 36.25 C1.455 38.56 1.785 40.87 2.125 43.25 C3.775 43.25 5.425 43.25 7.125 43.25 C7.455 42.26 7.785 41.27 8.125 40.25 C11.6875 39.0625 11.6875 39.0625 15.125 38.25 C15.125 35.28 15.125 32.31 15.125 29.25 C12.155 29.25 9.185 29.25 6.125 29.25 C6.125 27.6 6.125 25.95 6.125 24.25 C5.465 24.25 4.805 24.25 4.125 24.25 C4.125 22.27 4.125 20.29 4.125 18.25 C6.105 18.25 8.085 18.25 10.125 18.25 C10.125 20.23 10.125 22.21 10.125 24.25 C9.465 24.25 8.805 24.25 8.125 24.25 C8.125 25.24 8.125 26.23 8.125 27.25 C11.095 27.25 14.065 27.25 17.125 27.25 C17.455 28.24 17.785 29.23 18.125 30.25 C18.20726668 27.20613276 18.10108217 25.17824652 17.125 22.25 C17.455 21.59 17.785 20.93 18.125 20.25 C18.35934712 18.3370598 18.35934712 18.3370598 18.375 16.25 C18.40078125 15.54875 18.4265625 14.8475 18.453125 14.125 C18.34484375 13.50625 18.2365625 12.8875 18.125 12.25 C17.135 11.59 16.145 10.93 15.125 10.25 Z " fill="#000000" transform="translate(24.875,1.75)"/>
</svg></div>
`;

    const textSpan = document.createElement('span');
    textSpan.textContent = 'AI Helper';
    textSpan.classList = askDoubtBtn.childNodes[1].classList;
    aiButton.innerHTML = svgString;
    aiButton.appendChild(textSpan);

    askDoubtBtn.parentNode.insertBefore(aiButton, askDoubtBtn);

    //make title width 100% so that the new button is aligned to the right
    const problemHeading = document.querySelector('h4.problem_heading');
    problemHeading.style.width = '100%';

}

function loadAiKey() {
    chrome.storage.sync.get(['aiKey'], function (result) {
        aiKey = result.aiKey;
    });
}


function askApiKey() {
    // Create overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay');
    popupOverlay.style.display = 'flex';

    // Create popup container
    const popup = document.createElement('div');
    popup.classList.add('popup');

    // Create title
    const title = document.createElement('h4');
    title.classList.add('fw-bolder');
    title.classList.add('fs-4')
    title.classList.add('problem_heading');
    title.textContent = 'Gemini API Key Required';

    // Create content
    const content = document.createElement('div');
    content.style.paddingTop = '10px';
    content.style.fontSize = '14px';
    content.textContent = 'This extension requires a Gemini API key, which is free to obtain. Your API key will be stored securely in your browser and will never be transmitted.';

    // Create link
    const link = document.createElement('a');
    link.href = 'https://aistudio.google.com/app/apikey';
    link.target = '_blank';
    link.textContent = 'Get your Gemini API key here';
    link.style.fontSize = '14px';
    link.style.textDecoration = 'none';


    // Create input
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Paste your Gemini API key here';
    input.classList.add('ant-input');
    input.classList.add('rounded');
    input.autofocus = true;

    const btnRow = document.createElement('div');
    btnRow.classList.add('btn-row');

    // Create buttons
    const okButton = document.createElement('button');
    okButton.textContent = 'Set API Key';
    okButton.classList.add(
        'ant-btn',
        'css-19gw05y',
        'ant-btn-default',
        'Button_gradient_dark_button__r0EJI',
        'py-2',
        'px-4'
    );

    okButton.addEventListener('click', () => {
        if (input.value == null || input.value == "") {
            alert("API Key cannot be empty");
            return;
        }
        aiKey = input.value;
        document.body.removeChild(popupOverlay);
        document.getElementById('ai_button').click();
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add(
        'ant-btn',
        'css-19gw05y',
        'ant-btn-default',
        'Button_gradient_light_button__ZDAR_',
        'px-3',
        'px-sm-4',
        'py-2'
    );
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
    });

    // Append elements to popup
    popup.appendChild(title);
    popup.appendChild(content);
    popup.appendChild(link);
    popup.appendChild(input);

    btnRow.appendChild(cancelButton);
    btnRow.appendChild(okButton);
    popup.appendChild(btnRow);

    // Append popup to overlay
    popupOverlay.appendChild(popup);

    // Append overlay to body
    document.body.appendChild(popupOverlay);
}


// add chat ui to the page
function addChatUi() {
    if (document.getElementById('chat_ui_contanier')) {
        document.getElementById('chat_ui_contanier').remove();
        return;
    }
    btn = document.getElementById('ai_button');

    const chatUiContainer = document.createElement('div');
    chatUiContainer.id = 'chat_ui_contanier';
    chatUiContainer.style.height = '500px';
    chatUiContainer.style.width = '100%';


    const div = document.createElement('div');
    div.id = "chat_ui";
    div.style.height = '444px';
    div.style.width = '100%';
    div.style.overflow = 'scroll';
    div.style.padding = '8px';
    div.style.marginTop = '8px';
    div.style.border = '1px solid var(--color-border)';
    div.style.borderBottom = "none";
    div.style.borderRadius = '12px 12px 0 0';


    const chatInput = document.createElement('input');
    chatInput.id = 'ai_chat_input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Type your message here';
    chatInput.style.width = '100%';
    chatInput.style.minHeight = '56px';
    chatInput.style.margin = '0';
    chatInput.style.padding = '8px';
    chatInput.style.border = '1px solid var(--color-border)';
    chatInput.style.borderRight = 'none';
    chatInput.style.borderRadius = '0 0 0 12px';
    chatInput.style.backgroundColor = '#f9f9f9';
    chatInput.style.outlineWidth = '0';
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMsg();
        }
    });

    // Create the send button
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.height = '55.5px';
    sendButton.style.width = '64px';
    sendButton.style.borderRadius = '0 0 12px 0';
    sendButton.style.border = '1px solid var(--color-border)';
    sendButton.style.borderLeft = 'none';
    sendButton.style.backgroundColor = 'var(--color-secondary)';
    sendButton.style.color = 'var(--color-text-readability)';
    sendButton.addEventListener('click', function () {
        sendMsg();
    });

    const inputRow = document.createElement('div');
    inputRow.style.display = "flex";

    chatUiContainer.appendChild(div);
    inputRow.appendChild(chatInput);
    inputRow.appendChild(sendButton);
    chatUiContainer.appendChild(inputRow);
    btn.parentNode.insertAdjacentElement('afterend', chatUiContainer);
}

// send msg
function sendMsg() {
    if (document.getElementById('ai_processing')) {
        return;
    }
    const input = document.getElementById('ai_chat_input');
    const msg = input.value;
    input.value = "";
    if (msg == null || msg == "") {
        return;
    }
    const msgStruct = { type: 'user', msg: msg };
    chatHistory.push(msgStruct);
    updateChatUi(msgStruct);
    getAiResponse(msg);
}

function updateChatUi(msgStruct) {
    if (msgStruct.type == "model" && document.getElementById('ai_processing')) {
        document.getElementById('ai_processing').remove();
    }
    const chatUi = document.getElementById('chat_ui');
    const msgDiv = document.createElement('div');
    const msgDivContainer = document.createElement('div');
    msgDivContainer.style.display = 'flex';
    msgDivContainer.style.justifyContent = msgStruct.type === 'user' ? 'flex-end' : 'flex-start';

    msgDiv.style.padding = '8px';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.marginBottom = '8px';
    msgDiv.style.backgroundColor = msgStruct.type === 'user' ? 'var(--color-secondary)' : 'var(--color-primary)';
    msgDiv.style.color = msgStruct.type === 'user' ? 'var(--color-text-readability)' : "";
    msgDiv.style.maxWidth = '80%';
    msgDiv.style.overflowWrap = 'break-word';
    msgDiv.textContent = msgStruct.msg;
    msgDiv.display = 'inline-block';
    if (msgStruct.msg === 'Thinking...') {
        msgDiv.id = 'ai_processing';
    }
    msgDivContainer.appendChild(msgDiv);

    chatUi.appendChild(msgDivContainer);

    // scroll to the bottom of the chat if not vissible
    const isScrolledToBottom = chatUi.scrollHeight - chatUi.clientHeight <= chatUi.scrollTop + 1;
    if (!isScrolledToBottom) {
        chatUi.scrollTop = chatUi.scrollHeight;
    }

    //show processing if the message is from the user
    if (msgStruct.type === 'user') {
        const processingMsg = { type: 'ai', msg: 'Thinking...' };
        chatHistory.push(processingMsg);
        updateChatUi(processingMsg);
    }
}

function getAiResponse(msg) {
    // get solitions from localstorage
    const langselector = document.querySelector('span.ant-select-selection-item');
    const lang = langselector.textContent;
    const key = `course_${userId}_${currentProblem.id}_${lang}`;
    const solution = JSON.parse(localStorage.getItem(key)) ?? "";

    const requestData = {
        contents: []
    };

    //iterate over the chat history and add the previous messages
    chatHistory.forEach(chat => {
        if (chat.msg != "Thinking...") {
            requestData.contents.push({
                role: chat.type,
                parts: [
                    {
                        text: chat.msg
                    }
                ]
            });
        }
    });

    let sysIntructions = "";
    sysIntructions += `I am learning how to code and solve DSA problems and your are my AI mentor. You will only help me understand the problem and how to solve it. You will not answer questions not related to programming. Currently I have the following information about the problem.`;
    sysIntructions += `Title: ${currentProblem.title}\n`;
    sysIntructions += `Problem: ${currentProblem.problem}\n`;
    sysIntructions += `Constraints: ${currentProblem.constraints}\n`;
    sysIntructions += `Input : ${currentProblem.input_format}\n`;
    sysIntructions += `Output Format: ${currentProblem.output_format}\n`;
    sysIntructions += `Note: ${currentProblem.note}\n`;
    let hintsText = "";
    for (let hintKey in currentProblem.hints) {
        hintsText += currentProblem.hints[hintKey] + "\n";
    }

    let samplesText = "";
    currentProblem.samples.forEach(sample => {
        samplesText += `Input: ${sample.input}\nOutput: ${sample.output}\n\n`;
    });
    sysIntructions += `Samples: ${samplesText}\n`;
    sysIntructions += `My current solution: ${solution}\n`;
    sysIntructions += `The above is the context and do not consider it a part of our conversation.\n\n`;

    requestData.systemInstruction = {
        parts: [
            {
                text: sysIntructions
            }
        ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiKey}`;


    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            const extractedText = data.candidates[0].content.parts[0].text;
            const aiResponse = { type: 'model', msg: extractedText };
            chatHistory.push(aiResponse);
            updateChatUi(aiResponse);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}