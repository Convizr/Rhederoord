export const PersonalInfoFormExtension = {
    name: 'PersonalInfoForm',
    type: 'response',
    match: ({ trace }) =>
      trace.type === 'personal_info_form' || trace.payload.name === 'personal_info_form',
    render: ({ trace, element }) => {
      console.log('Rendering PersonalInfoFormExtension');
  
      let payloadObj;
      if (typeof trace.payload === 'string') {
        payloadObj = JSON.parse(trace.payload);
      } else {
        payloadObj = trace.payload;
      }
  
      console.log('Payload:', payloadObj);
  
      // Extracting variables from the payload
      const {
        eventTypeData,
        lb_personalInfo, // Updated the variable name here
        lb_eventType,
        lb_firstName,
        lb_lastName,
        lb_firstNamePartner,
        lb_lastNamePartner,
        lb_email,
        lb_phoneNumber,
        lb_other,
        bt_submit
      } = payloadObj;
  
      const eventOptions = eventTypeData.split(',');
  
      const formContainer = document.createElement('form');
  
      formContainer.innerHTML = `
        <style>
          label {
            display: block;
            margin: 5px 0;
            font-size: 14px;
          }
          input, select {
            width: 90%; /* Adjusted width to 90% */
            padding: 6px;
            margin: 6px 0;
            display: inline-block;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          select {
            background-color: #f1f1f1;
            color: #000;
          }
          .hidden {
            display: none;
          }
          .visible {
            display: block;
          }
          input[type="submit"] {
            background-color: rgb(173, 32, 31);
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
            display: block;
            width: auto;
            margin-top: 10px;
          }
          input[type="submit"]:hover {
            background-color: rgb(138, 26, 25);
          }
          fieldset {
            border: none;
            padding: 0;
          }
          legend {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
        </style>
  
        <fieldset id="personalInformation">
          <legend>${lb_personalInfo}</legend>
          
          <label for="eventType">${lb_eventType}</label>
          <select id="eventType" name="eventType" required>
            <option value="" disabled selected>Kies een feest</option>
            ${eventOptions.map(option => `<option value="${option.trim()}">${option.trim()}</option>`).join('')}
          </select>
  
          <div id="personalFields" class="hidden">
            <label for="firstName">${lb_firstName}</label>
            <input type="text" id="firstName" name="firstName" required placeholder="Naam">
  
            <label for="lastName">${lb_lastName}</label>
            <input type="text" id="lastName" name="lastName" required placeholder="Achternaam">
  
            <div id="partnerFields" class="hidden">
              <label for="firstNamePartner">${lb_firstNamePartner}</label>
              <input type="text" id="firstNamePartner" name="firstNamePartner" placeholder="Voornaam Partner">
  
              <label for="lastNamePartner">${lb_lastNamePartner}</label>
              <input type="text" id="lastNamePartner" name="lastNamePartner" placeholder="Achternaam Partner">
            </div>
  
            <label for="email">${lb_email}</label>
            <input type="email" id="email" name="email" required placeholder="E-mail adres">
  
            <label for="phoneNumber">${lb_phoneNumber}</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" required placeholder="Telefoonnr.">
  
            <div id="otherField" class="hidden">
              <label for="other">${lb_other}</label>
              <input type="text" id="other" name="other" placeholder="Anders">
            </div>
          </div>
  
          <input type="submit" value="${bt_submit}">
        </fieldset>
      `;
  
      const eventTypeSelect = formContainer.querySelector('#eventType');
      const personalFields = formContainer.querySelector('#personalFields');
      const partnerFields = formContainer.querySelector('#partnerFields');
      const otherField = formContainer.querySelector('#otherField');
  
      eventTypeSelect.addEventListener('change', function () {
        const selectedEventType = eventTypeSelect.value;
        
        // Reset visibility of all conditional fields
        partnerFields.classList.add('hidden');
        otherField.classList.add('hidden');
        personalFields.classList.add('hidden');
  
        // Language-independent matching for "Wedding" and "Other"
        if (selectedEventType) {
          personalFields.classList.remove('hidden');
  
          // Match "Wedding" based on position or specific value (in Dutch "Bruiloft")
          if (selectedEventType.toLowerCase().includes('bruiloft') || eventOptions.indexOf(selectedEventType) === 0) {
            partnerFields.classList.remove('hidden');
          }
          // Match "Other" based on position or specific value
          else if (selectedEventType.toLowerCase().includes('other') || eventOptions.indexOf(selectedEventType) === eventOptions.length - 1) {
            otherField.classList.remove('hidden');
          }
        }
      });
  
      formContainer.addEventListener('submit', function (event) {
        event.preventDefault();
  
        const firstName = formContainer.querySelector('#firstName').value;
        const lastName = formContainer.querySelector('#lastName').value;
        const firstNamePartner = formContainer.querySelector('#firstNamePartner') ? formContainer.querySelector('#firstNamePartner').value : null;
        const lastNamePartner = formContainer.querySelector('#lastNamePartner') ? formContainer.querySelector('#lastNamePartner').value : null;
        const email = formContainer.querySelector('#email').value;
        const phoneNumber = formContainer.querySelector('#phoneNumber').value;
        const other = formContainer.querySelector('#other') ? formContainer.querySelector('#other').value : null;
  
        const selectedEventType = eventTypeSelect.value;
  
        const payloadData = {
          eventType: selectedEventType,
          firstName,
          lastName,
          email,
          phoneNumber
        };
  
        if (selectedEventType.toLowerCase().includes('bruiloft') || eventOptions.indexOf(selectedEventType) === 0) {
          payloadData.firstNamePartner = firstNamePartner;
          payloadData.lastNamePartner = lastNamePartner;
        }
  
        if (selectedEventType.toLowerCase().includes('other') || eventOptions.indexOf(selectedEventType) === eventOptions.length - 1) {
          payloadData.other = other;
        }
  
        // Sending the form data via Voiceflow's chat API
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: payloadData
        });
      });
  
      element.appendChild(formContainer);
    },
  };