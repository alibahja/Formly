import {Form} from '../models/form.js';
import {reviseForm} from '../services/ai.js';
import {applyFieldOperations} from '../services/diff.js';

// POST /api/forms/:id/chat
export async function chat(req,res){
    try {
        if(!req.user) return res.status(401).json({error:"Unauthorized"});

        const {prompt}=req.body;
        if(!prompt || typeof prompt !=="string" || prompt.trim().length===0){
            return res.status(400).json({ error: "A prompt is required" });
        }
        const form=await Form.findOne({
            _id:req.params.id,
            owner:req.user.userId,
        });
        if (!form) return res.status(404).json({ error: "Form not found" });

        //Gaurd don't allow all revisions mid revision
        if(form.status==="revising"){
            return res.status(409).json({ error: "A revision is already in progress" });
        }

        //Mark state+ save user message
        form.status="revising";
        form.messages.push({
            role:"user",
            content:prompt.trim(),
            timestamp:new Date(),
        });
        await form.save();

        try {
            // Build recent conversation context (last 5 messages, excluding this new one)
            const recentMessages = form.messages
                .slice(-6, -1)
                .map((m) => ({ role: m.role, content: m.content }));

            // Ask the AI to plan the operations
            const result = await reviseForm(
                prompt.trim(),
                {
                _id: form._id,
                name: form.name,
                description: form.description,
                fields: form.fields,
                },
                recentMessages
            );

            // Apply ops to fields
            const { fields: updatedFields, applied, errors } = applyFieldOperations(
                form.fields,
                result.operations
            );

            // Save
            form.fields = updatedFields;
            form.version += 1;
            form.status = "completed";
            form.error = null;

            // Summary message for the chat UI
            const summaryText =
                result.description +
                (errors.length > 0 ? `\n\nSome operations failed:\n- ${errors.join("\n- ")}` : "");

            form.messages.push({
                role: "assistant",
                content: summaryText,
                timestamp: new Date(),
            });

            await form.save();

            res.json({
                _id: form._id,
                name: form.name,
                description: form.description,
                fields: form.fields,
                messages: form.messages,
                version: form.version,
                status: form.status,
                applied,
                errors,
                aiDescription: result.description,
            });
        } catch (err) {
            console.error(`[AI Revision Error] ${err.message}`);
            form.status = "failed";
            form.error = err.message;
            form.messages.push({
                role: "assistant",
                content: `Revision failed: ${err.message}`,
                timestamp: new Date(),
            });
            await form.save();
            res.status(500).json({ error: err.message || "Failed to process revision request" });
        }

    } catch (err) {
        console.error("Chat error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}