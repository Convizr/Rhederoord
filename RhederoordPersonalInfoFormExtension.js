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
      lb_personalInformation,
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
          margin: 10px 0 5px;
          font-size: 16px;
        }
        input, select {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          display: inline-block;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
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
          padding: 15px;
          border-radius: 5px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          text-align: center;
          display: block;
          width: 100%;
        }
        input[type="submit"]:hover {
          background-color: rgb(138, 26, 25);
        }
        fieldset {
          border: none;
          padding: 0;
        }
        legend {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
      </style>

      <fieldset id="personalInformation">
        <legend>${lb_personalInformation}</legend>
        
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

      // Show the appropriate fields based on the selected event type
      if (selectedEventType) {
        personalFields.classList.remove('hidden');

        if (selectedEventType === 'Wedding') {
          partnerFields.classList.remove('hidden');
        } else if (selectedEventType === 'Other') {
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

      if (selectedEventType === 'Wedding') {
        payloadData.firstNamePartner = firstNamePartner;
        payloadData.lastNamePartner = lastNamePartner;
      }

      if (selectedEventType === 'Other') {
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