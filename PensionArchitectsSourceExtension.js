export const SourceBlocksExtension = {
    name: "SourceBlocks",
    type: "response",
    match: ({ trace }) =>
      trace.type === "Custom_SourceBlocks" ||
      (trace.payload && trace.payload.name === "Custom_SourceBlocks"),
    render: ({ trace, element }) => {
      // Remove background from the message block
      element.style.background = "transparent";
  
      // 1) Convert the entire trace.payload from string -> object
      let payloadObj;
      if (typeof trace.payload === "string") {
        try {
          payloadObj = JSON.parse(trace.payload);
        } catch (err) {
          console.error("Error parsing entire trace.payload:", err);
          payloadObj = {};
        }
      } else {
        // If it's already an object
        payloadObj = trace.payload || {};
      }
      console.log("Parsed payloadObj:", payloadObj);
  
      // 2) Parse dataChunks if it’s a string
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
  
      // Pagination variables
      let currentIndex = 0; // we'll show dataChunks in pairs [currentIndex, currentIndex+1]
      const BLOCKS_PER_PAGE = 2;
  
      // 3) Build style and static container
      let html = `
        <style>
          .source-blocks-container {
            display: flex;
            flex-wrap: wrap;
            /* no gap */
            font-family: Arial, sans-serif;
            margin-bottom: 10px; /* space above next/prev buttons */
          }
          .source-block {
            background: none;
            border: 1px solid #bdbcbc;
            border-radius: 8px;
            width: 135px;
            height: 130px;
            padding: 5px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            /* no gap */
            margin-right: 8px; /* small space between blocks */
            margin-bottom: 8px;
            color: #000;
          }
          .summary-text {
            font-size: 14px;
            line-height: 1.3em;
            margin-bottom: 5px;
            overflow: hidden;
          }
          .source-row {
            display: flex;
            align-items: center;
            font-size: 14px;
          }
          .source-type-icon {
            font-size: 16px;
            margin-right: 4px;
          }
          .source-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }
          .nav-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
          }
          .nav-btn {
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
            border: 1px solid #bdbcbc;
            border-radius: 4px;
            background: #f9f9f9;
          }
          .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        </style>
        <div class="source-blocks-container" id="blocksContainer"></div>
      `;
  
      // If we have more than 2 blocks, add nav buttons
      if (dataChunks.length > BLOCKS_PER_PAGE) {
        html += `
          <div class="nav-buttons">
            <button class="nav-btn" id="prevBtn">&laquo; Prev</button>
            <button class="nav-btn" id="nextBtn">Next &raquo;</button>
          </div>
        `;
      }
  
      element.innerHTML = html;
  
      // 4) Now we have #blocksContainer for rendering blocks
      const blocksContainer = element.querySelector("#blocksContainer");
      const prevBtn = element.querySelector("#prevBtn");
      const nextBtn = element.querySelector("#nextBtn");
  
      // Function to render the current "page" of blocks
      function renderBlocks() {
        // slice the data for the current page
        const pageItems = dataChunks.slice(currentIndex, currentIndex + BLOCKS_PER_PAGE);
        // build the HTML for these items
        const blocksHtml = pageItems.map(chunk => {
          const { content, source } = chunk;
          const summary = content && content.length > 80
            ? content.substring(0, 80) + "..."
            : (content || "");
  
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
  
        blocksContainer.innerHTML = blocksHtml;
  
        // Update button states
        if (prevBtn) {
          prevBtn.disabled = (currentIndex <= 0);
        }
        if (nextBtn) {
          nextBtn.disabled = (currentIndex + BLOCKS_PER_PAGE >= dataChunks.length);
        }
      }
  
      // 5) Attach event listeners to next/prev if they exist
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentIndex > 0) {
            currentIndex -= BLOCKS_PER_PAGE;
            renderBlocks();
          }
        });
      }
  
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentIndex + BLOCKS_PER_PAGE < dataChunks.length) {
            currentIndex += BLOCKS_PER_PAGE;
            renderBlocks();
          }
        });
      }
  
      // 6) Initial render
      renderBlocks();
    },
  };  