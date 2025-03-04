export const SourceBlocksExtension = {
    name: "SourceBlocks",
    type: "response",
    match: ({ trace }) =>
      trace.type === "Custom_SourceBlocks" ||
      (trace.payload && trace.payload.name === "Custom_SourceBlocks"),
    render: ({ trace, element }) => {
      // 1) Convert entire trace.payload from string -> object
      let payloadObj;
      if (typeof trace.payload === "string") {
        try {
          payloadObj = JSON.parse(trace.payload);
        } catch (err) {
          console.error("Error parsing entire trace.payload:", err);
          payloadObj = {};
        }
      } else {
        payloadObj = trace.payload || {};
      }
      console.log("Parsed payloadObj:", payloadObj);
  
      // 2) Now parse dataChunks if it’s a string
      let dataChunks = [];
      if (typeof payloadObj.dataChunks === "string") {
        try {
          dataChunks = JSON.parse(payloadObj.dataChunks);
        } catch (err) {
          console.error("Error parsing payloadObj.dataChunks:", err);
        }
      } else if (Array.isArray(payloadObj.dataChunks)) {
        dataChunks = payloadObj.dataChunks;
      }
      console.log("Final dataChunks:", dataChunks);
  
      // 3) Build style + container + blocks
      //    - We target ONLY the bubble that contains our .source-blocks-container
      //      so we don't remove backgrounds for all .vfrc-message elements.
      const styleString = `
        <style>
          /* 
            Remove background ONLY for this extension's message bubble 
            by selecting .vfrc-message that directly contains .source-blocks-container 
          */
          .vfrc-message > .source-blocks-container {
            background: transparent !important;
          }
  
          .source-blocks-container {
            display: flex;
            flex-wrap: nowrap;
            /* The container is sized for 2 blocks + 1 gap (12px).
               2 * 135 + 12 = 282px total width. */
            width: 282px;
            overflow: hidden;
            font-family: Arial, sans-serif;
            margin-bottom: 10px; /* space above the arrows */
            gap: 12px; /* keep a 12px gap between blocks */
          }
  
          .source-block {
            background: #DCE0EF;
            color: #000;
            border: 1px solid #bdbcbc;
            border-radius: 8px;
            padding: 5px;
            width: 135px;
            height: 85px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
  
          .summary-text {
            font-size: 10px;
            line-height: 1.3em;
            margin-bottom: 4px;
            overflow: hidden;
          }
  
          .source-row {
            display: flex;
            align-items: center;
            font-size: 14px;
            /* no gap here */
          }
  
          .source-type-icon {
            font-size: 16px;
          }
  
          .source-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            font-size: 12px;
          }
  
          /* Carousel controls */
          .carousel-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
          }
          .arrow-btn {
            border: none;
            background: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
          }
          .arrow-btn:hover {
            color: #333;
          }
        </style>
      `;
  
      // Build each block's HTML
      const blocksHtml = dataChunks.map((chunk) => {
        const { content, source } = chunk;
        // Truncate to ~80 chars
        const summary =
          content && content.length > 80
            ? content.substring(0, 80) + "..."
            : content || "";
  
        const sourceName = source?.name || "Unknown Source";
        const sourceType = source?.type || "unknown";
  
        return `
          <div class="source-block">
            <div class="summary-text">${summary}</div>
            <div class="source-row">
              <div class="source-type-icon">
                ${sourceType === "pdf" ? "📄" : "ℹ️"}
              </div>
              <div class="source-name" title="${sourceName}">
                ${sourceName}
              </div>
            </div>
          </div>
        `;
      }).join("");
  
      // Combine style + container + blocks
      // We add an id="blocksTrack" for referencing the block list
      const finalHtml = `
        ${styleString}
        <div class="source-blocks-container" id="blocksTrack">
          ${blocksHtml}
        </div>
        <div class="carousel-controls" id="carouselControls" style="display: none;">
          <button class="arrow-btn" id="prevBtn"><strong>«</strong></button>
          <button class="arrow-btn" id="nextBtn"><strong>»</strong></button>
        </div>
      `;
  
      // 4) Set element.innerHTML
      element.innerHTML = finalHtml;
  
      // 5) If we have more than 2 chunks, show the arrows
      if (dataChunks.length > 2) {
        const controls = element.querySelector("#carouselControls");
        if (controls) controls.style.display = "flex";
  
        // 6) "2 at a time" logic
        const blocksTrack = element.querySelector("#blocksTrack");
        const blockEls = blocksTrack.querySelectorAll(".source-block");
        let currentIndex = 0;
        const cardsToShow = 2;
  
        // Hide all blocks except the first 2
        function updateDisplay() {
          blockEls.forEach((block, i) => {
            if (i >= currentIndex && i < currentIndex + cardsToShow) {
              block.style.display = "flex";
            } else {
              block.style.display = "none";
            }
          });
        }
        updateDisplay(); // initial
  
        // 7) Next/Prev buttons
        const prevBtn = element.querySelector("#prevBtn");
        const nextBtn = element.querySelector("#nextBtn");
  
        prevBtn.addEventListener("click", () => {
          if (currentIndex > 0) {
            currentIndex -= cardsToShow;
            updateDisplay();
          }
        });
  
        nextBtn.addEventListener("click", () => {
          if (currentIndex + cardsToShow < blockEls.length) {
            currentIndex += cardsToShow;
            updateDisplay();
          }
        });
      }
    },
  };
  
  export const DynamicButtonExtension = {
    name: "DynamicButtonExtension",
    type: "response",
    match: ({ trace }) =>
      trace.type === "Custom_DynamicButtons" ||
      (trace.payload && trace.payload.name === "Custom_DynamicButtons"),
    render: ({ trace, element }) => {
      console.log("Rendering DynamicButtonExtension...");
  
      // 1) Parse the payload
      let payloadObj;
      if (typeof trace.payload === "string") {
        try {
          payloadObj = JSON.parse(trace.payload);
        } catch (err) {
          console.error("Error parsing trace.payload:", err);
          payloadObj = {};
        }
      } else {
        payloadObj = trace.payload || {};
      }
      console.log("Payload object:", payloadObj);
  
      // 2) Get the customerPlans array (JSON) from the payload
      let customerPlans = [];
      if (typeof payloadObj.customerPlans === "string") {
        try {
          customerPlans = JSON.parse(payloadObj.customerPlans);
        } catch (err) {
          console.error("Error parsing customerPlans:", err);
          customerPlans = [];
        }
      } else if (Array.isArray(payloadObj.customerPlans)) {
        customerPlans = payloadObj.customerPlans;
      }
      console.log("Parsed customerPlans:", customerPlans);
  
      // 3) If only one plan, skip buttons and immediately send the code back
      if (customerPlans.length === 1) {
        const singlePlan = customerPlans[0];
        console.log("Only one plan found:", singlePlan);
  
        // Immediately send the code as ProjectID
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: {
            ProjectID: singlePlan.code
          }
        });
        return; // Stop rendering
      }
  
      // 4) If multiple plans, create a container and show each plan as a button
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      container.style.gap = "10px"; // spacing between buttons
  
      // Add a small inline style or class for the buttons
      const styleTag = document.createElement("style");
      styleTag.textContent = `
        .dynamic-plan-btn {
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        .dynamic-plan-btn:hover {
          background: #ddd;
        }
      `;
      document.head.appendChild(styleTag);
  
      // Build a button for each plan
      customerPlans.forEach((plan) => {
        const btn = document.createElement("button");
        btn.className = "dynamic-plan-btn";
        btn.textContent = plan.name; // show the "name" on the button
  
        // On click, send the plan's "code" as ProjectID
        btn.addEventListener("click", () => {
          console.log("Selected plan:", plan);
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              ProjectID: plan.code
            }
          });
        });
  
        container.appendChild(btn);
      });
  
      // 5) Append the container to the extension element
      element.appendChild(container);
    },
  };