import {Form} from '../models/form.js'
import {Submission} from '../models/submission.js'
import { User } from '../models/user.js';
import {generateForm} from "../services/ai.js";


//Post /api/forms
// Generate a form from a text prompt using AI (synchronous)
export async function createForm(req,res){
    try {
        const {prompt}=req.body;
        
        if(!prompt || typeof prompt !=="string" || prompt.trim().length===0){
            return res.status(400).json({error:"A prompt is required."})
        }
        if(!req.user){
            return res.status(401).json({error:"Unauthorized"});
        }

        const generated=await generateForm(prompt.trim());

        if(!Array.isArray(generated.fields) || generated.fields.length===0){
            return res.status(500).json({error:"AI failed to generate any fields. Please try again."})
        }

        const form=await Form.create({
            name:generated.name || "Untitled Form",
            description:generated.description || "",
            fields:generated.fields,
            owner:req.user.userId,
            status:"completed",
            version:1
        });

        res.status(201).json({
            _id:form._id,
            name:form.name,
            description:form.description,
            fields: form.fields,
            version: form.version,
            status: form.status,
            published: form.published,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
        });
    } catch (err) {
         console.error("Create form error:", err);
         res.status(500).json({ error: "Failed to generate form. Please try again." });
    }
}

//Get /api/forms
// List all forms owned by the current user (newest first)
export async function listForms(req,res){
    try {
        if(!req.user){
            return res.status(401).json({error:"Unauthorized"})
        }

        const forms=await Form.find(
            {owner:req.user.userId},
            { name: 1, description: 1, version: 1, published: 1, createdAt: 1, updatedAt: 1 }
        ).sort({updatedAt:-1});
        
        res.json(forms);
    } catch (err) {
        console.error("List forms error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Get /api/forms/:id
// get full details of one form (owner only)
export async function getForm(req,res){
    try {
        if(!req.user)return res.status(401).json({error:"Unauthorized"})

        const form=await Form.findOne({
            _id:req.params.id,
            owner:req.user.userId,
        });

        if(!form) return res.status(404).json({error:"Form not found"});

        res.json({
            _id: form._id,
            name: form.name,
            description: form.description,
            fields: form.fields,
            version: form.version,
            status: form.status,
            published: form.published,
            publishedAt: form.publishedAt,
            messages: form.messages,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt,
        })
    } catch (err) {
        console.error("Get form error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// DELETE /api/forms/:id
// Delete a form AND all its submissions (cascade)
export async function deleteForm(req,res){
    try {
        if(!req.user)return res.status(401).json({error:"Unauthorized"});

        const form=await Form.findOne({
            _id:req.params.id,
            owner:req.user.userId,
        })
        
        if(!form) return res.status(404).json({error:"Form not found"});

        await Submission.deleteMany({form:form._id});
        await Form.deleteOne({form:form._id});

        res.json({succes:true});
    } catch (err) {
        console.error("Delete form error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// PUT /api/forms/:id
// Manual edit — replaces name/description/fields with what the client sends
export async function updateForm(req,res){
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});

        const {name,description,fields}=req.body;

        if(!Array.isArray(fields)) return res.status(404).json({error:"Fields must be an array"});

        const form =await Form.findOne({
            _id:req.params.id,
            owner:req.user.userId,
        });
        if(!form) return res.status(404).json({error:"No form found"})

        // Only overwrite fields that were provided (allow partial updates)
        if (typeof name === "string" && name.trim().length > 0) form.name = name.trim();
        if (typeof description === "string") form.description = description;
        form.fields = fields;
        form.version += 1;

        await form.save();

        res.json({
        _id: form._id,
        name: form.name,
        description: form.description,
        fields: form.fields,
        version: form.version,
        updatedAt: form.updatedAt,
        });
    } catch (err) {
          if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message });
          }
            console.error("Update form error:", err);
            res.status(500).json({ error: "Internal server error" });
    }
}

// POST /api/forms/:id/publish
// Flip the published flag so the form can be filled at /f/:id
export async function publishForm(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { published: true, publishedAt: new Date() },
      { returnDocument: "after" }
    );

    if (!form) return res.status(404).json({ error: "Form not found" });

    res.json({ success: true, published: form.published });
  } catch (err) {
    console.error("Publish form error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/forms/public/:id
// Public read — only published forms, only public-safe fields
export async function getPublicForm(req, res) {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      published: true,
    });

    if (!form) return res.status(404).json({ error: "Form not found or not published" });

    res.json({
      _id: form._id,
      name: form.name,
      description: form.description,
      fields: form.fields,
      version: form.version,
    });
  } catch (err) {
    console.error("Get public form error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}