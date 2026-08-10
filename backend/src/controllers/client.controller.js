const clientModel = require("../models/client.model");
const { sendRegistrationEmail, sendStatusUpdateEmail } = require("../services/email.service");

// Helper to generate unique reference number in format YYYY-XXXXXX
function generateReferenceNo() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${year}-${randomDigits}`;
}

/**
 * Register/Create a new Client Application
 */
exports.createClient = async (req, res) => {
  const {
    referenceNo,
    Category,
    category,
    FullName,
    surname,
    givenName,
    Email,
    email,
    Gender,
    gender,
    Address,
    address,
    telephone,
    phone,
    DOB,
    dob,
    POB,
    placeOfBirth,
    CountryofCitizenship,
    citizenship,
    PassportNumber,
    idNumber,
    Status,
    status,
    Paragraph,
    remarks
  } = req.body;

  try {
    // Normalize field names across frontend variations
    const clientEmail = (Email || email || "").trim();
    const passport = (PassportNumber || idNumber || "").trim();
    const name = (FullName || (givenName || surname ? `${givenName || ""} ${surname || ""}`.trim() : "")).trim();
    const appCategory = Category || category || "Immigration Non-Resident Workers";
    const appGender = Gender || gender || "Male";
    const appAddress = Address || address || "N/A";
    const appPhone = telephone || phone || "N/A";
    const appDob = DOB || dob || new Date();
    const appPob = POB || placeOfBirth || "N/A";
    const appCitizenship = CountryofCitizenship || citizenship || "Macau";
    const appStatus = Status || status || "Pending";
    const appRemarks = Paragraph || remarks || "Currently the status is pending, the application is under review.";

    // Determine reference number in YYYY-(some no.) format
    let finalRefNo = (referenceNo || "").trim();
    if (!finalRefNo) {
      finalRefNo = generateReferenceNo();
    } else {
      // Ensure referenceNo conforms to YYYY-(some no.) if missing hyphen
      if (!/^\d{4}-/.test(finalRefNo)) {
        const year = new Date().getFullYear();
        const cleanRef = finalRefNo.replace(/[^a-zA-Z0-9]/g, "");
        finalRefNo = `${year}-${cleanRef}`;
      }
    }

    if (!clientEmail || !passport || !name) {
      return res.status(400).json({
        message: "Mandatory fields missing: Email, Passport / ID Number, and Name are required."
      });
    }

    // Ensure uniqueness of referenceNo
    const existingRef = await clientModel.findOne({ referenceNo: finalRefNo });
    if (existingRef) {
      finalRefNo = generateReferenceNo();
    }

    const newClient = new clientModel({
      referenceNo: finalRefNo,
      Category: appCategory,
      FullName: name,
      Email: clientEmail,
      Gender: appGender,
      Address: appAddress,
      telephone: appPhone,
      DOB: appDob,
      POB: appPob,
      CountryofCitizenship: appCitizenship,
      PassportNumber: passport,
      Status: appStatus,
      Paragraph: appRemarks
    });

    await newClient.save();

    // Trigger email notification to user
    const emailResult = await sendRegistrationEmail(newClient);

    return res.status(201).json({
      success: true,
      message: `Client application created successfully with Reference No: ${finalRefNo}`,
      client: newClient,
      emailSent: emailResult.success,
      emailDetails: emailResult
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Client Status Search
 * Requires ALL 3 parameters: Passport No + Ref No + Email ID
 */
exports.getAClients = async (req, res) => {
  const { PassportNumber, idNumber, referenceNo, RefNo, Email, email } = req.body;

  const passport = (PassportNumber || idNumber || "").trim();
  const refNo = (referenceNo || RefNo || "").trim();
  const clientEmail = (Email || email || "").trim();

  try {
    // Validate that ALL THREE criteria are provided
    if (!passport || !refNo || !clientEmail) {
      return res.status(400).json({
        message: "Client application status lookup requires ALL 3 fields: Passport Number, Reference Number, and Email Address."
      });
    }

    // Query requiring exact case-insensitive match on all 3 fields
    const query = {
      PassportNumber: { $regex: new RegExp(`^${passport}$`, "i") },
      referenceNo: { $regex: new RegExp(`^${refNo}$`, "i") },
      Email: { $regex: new RegExp(`^${clientEmail}$`, "i") }
    };

    const client = await clientModel.findOne(query);

    if (!client) {
      return res.status(404).json({
        message: "No application found matching the provided Passport Number, Reference Number, and Email Address. Please verify your details."
      });
    }

    return res.status(200).json(client);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Admin Search for Applications
 * Admin can search by EITHER Passport No OR Reference No
 */
exports.searchClientsAdmin = async (req, res) => {
  const { query, passportNo, refNo } = req.body;
  const searchTerm = (query || passportNo || refNo || "").trim();

  try {
    let clients;
    if (!searchTerm) {
      clients = await clientModel.find().sort({ createdAt: -1 });
    } else {
      const searchFilter = {
        $or: [
          { PassportNumber: { $regex: searchTerm, $options: "i" } },
          { referenceNo: { $regex: searchTerm, $options: "i" } },
          { FullName: { $regex: searchTerm, $options: "i" } },
          { Email: { $regex: searchTerm, $options: "i" } }
        ]
      };
      clients = await clientModel.find(searchFilter).sort({ createdAt: -1 });
    }

    for (let client of clients) {
      if (!client.referenceNo) {
        client.referenceNo = generateReferenceNo();
        await client.save();
      }
    }

    return res.status(200).json(clients);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Get all client applications (Admin)
 */
exports.getAllClients = async (req, res) => {
  try {
    const clients = await clientModel.find().sort({ createdAt: -1 });

    // Ensure all existing DB documents have a valid referenceNo
    for (let client of clients) {
      if (!client.referenceNo) {
        client.referenceNo = generateReferenceNo();
        await client.save();
      }
    }

    return res.status(200).json(clients);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update/Edit a client application (Admin)
 */
exports.editClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await clientModel.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client application not found" });
    }

    Object.assign(client, req.body);
    await client.save();

    // Trigger status update email
    let emailResult = null;
    if (client.Email) {
      emailResult = await sendStatusUpdateEmail(client);
    }

    return res.status(200).json({
      success: true,
      client,
      emailSent: emailResult ? emailResult.success : false,
      emailDetails: emailResult
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * Delete a client application (Admin)
 */
exports.deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await clientModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Client application not found" });
    }
    return res.status(200).json({ message: "Client application deleted successfully", id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
