document.addEventListener("DOMContentLoaded", () => {
    const initialStateDiv = document.getElementById("initial-state");
    const initialChatInput = document.getElementById("initial-chat-input");
    const initialSendButton = document.getElementById("initial-send-button");

    const chatMessagesContainer = document.getElementById(
        "chat-messages-container"
    );
    const fixedBottomInputDiv = document.getElementById("fixed-bottom-input");
    const chatInputActive = document.getElementById("chat-input-active");
    const chatSendButtonActive = document.getElementById(
        "chat-send-button-active"
    );

    // Enhanced loading state with a spinner
    const loading = document.createElement("div");
    loading.className = "flex justify-center items-center my-4";
    loading.innerHTML = `
        <span class="text-center animate-pulse text-pink-400">Thinking...</span>
    `;

    let chatStarted = false;
    const threadId =
        "thread_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    initialChatInput?.addEventListener("keyup", (e) =>
        handleInputEvent(e, "initial")
    );
    initialSendButton?.addEventListener("click", (e) =>
        handleInputEvent(e, "initial")
    );

    chatInputActive?.addEventListener("keyup", (e) =>
        handleInputEvent(e, "active")
    );
    chatSendButtonActive?.addEventListener("click", (e) =>
        handleInputEvent(e, "active")
    );

    function handleInputEvent(e, context) {
        const isEnterKey = e.key === "Enter";
        const isButtonClick = e.type === "click";

        if (!isEnterKey && !isButtonClick) {
            return;
        }

        let inputText = "";
        if (context === "initial") {
            inputText = initialChatInput.value.trim();
            if (isEnterKey) e.preventDefault();
        } else {
            inputText = chatInputActive.value.trim();
            if (isEnterKey) e.preventDefault();
        }

        if (!inputText) {
            return;
        }

        generate(inputText, context);
    }

    function appendMessage(text, sender) {
        const msg = document.createElement("div");
        msg.classList.add(
            "my-4",
            "p-3",
            "rounded-xl",
            "w-fit",
            "max-w-lg", 
            "break-words",
            "shadow-lg" 
        );
        if (sender === "user") {
            msg.classList.add("bg-pink-600", "text-white", "ml-auto");
        } else if (sender === "system") {
            msg.classList.add("bg-neutral-700", "text-white", "mr-auto");
        } else if (sender === "error") {
            msg.classList.add("bg-red-600", "text-white", "mr-auto");
        }
        msg.textContent = text;
        chatMessagesContainer?.appendChild(msg);

        
        setTimeout(() => {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }, 50);
    }

    function appendVerdictCard(result) {
    const { verdict, summary, confidence, sources } = result;

    const verdictColorMap = {
        "True": "bg-green-500",
        "False": "bg-red-500",
        "Misleading": "bg-amber-500",
        "Unverified": "bg-gray-500",
    };
    const verdictColor = verdictColorMap[verdict] || "bg-gray-500";

    const card = document.createElement("div");
    card.className = "my-4 p-4 rounded-xl bg-neutral-800 text-white max-w-lg shadow-lg";



    card.innerHTML = `
        <div class="flex items-center gap-4">
            <span class="font-bold px-3 py-1 rounded-full text-white text-sm ${verdictColor}">${verdict}</span>
            ${confidence !== undefined ? `<span class="text-sm text-gray-400 font-semibold">Confidence: ${confidence}%</span>` : ''}
        </div>
        <p class="mt-3 text-base">${summary}</p>
        <div class="mt-4">
            <button class="text-pink-400 hover:underline text-sm font-semibold">Explain further</button>
        </div>
    `;

    chatMessagesContainer.appendChild(card);

    setTimeout(() => {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }, 50);
}


    async function callBackend(message) {
        try {
            const response = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                    threadId: threadId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error calling backend:", error);
            return {
                message: {
                    verdict: "Error",
                    summary: "Sorry, there was an error processing your request.",
                    sources: [],
                }
            };
        }
    }


    async function generate(text, context) {
        if (!chatStarted) {
            initialStateDiv.classList.add("hidden");
            chatMessagesContainer.classList.remove("hidden");
            fixedBottomInputDiv.classList.remove("hidden");
            chatStarted = true;
            chatInputActive.value = "";
            chatInputActive.focus();
        }

        if (context === "initial") {
            initialChatInput.value = "";
        } else {
            chatInputActive.value = "";
        }

        appendMessage(text, "user");

        chatMessagesContainer?.appendChild(loading);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        const result = await callBackend(text);

        loading.remove();

        if (result.message.type === "opinion") {
            appendMessage(result.message.message, "system");
        } else if (result.message.verdict) {
            appendVerdictCard(result.message);
        } else {
            appendMessage(JSON.stringify(result), "system"); 
        }
    }
});

