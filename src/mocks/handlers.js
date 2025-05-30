// mocks/handlers.js
import { rest } from "msw";
import {
  dummySubmissions,
  dummyVersions,
  dummyContributors,
} from "@/data/dummyContentData";

export const handlers = [
  // Get submissions
  rest.get("/api/content/submissions", (req, res, ctx) => {
    return res(ctx.delay(150), ctx.json(dummySubmissions));
  }),

  // Submit new content
  rest.post("/api/content/submit", async (req, res, ctx) => {
    const { title, content, contentType } = await req.json();
    const newSubmission = {
      id: `sub${dummySubmissions.length + 1}`,
      title,
      content,
      contentType,
      status: "pending_review",
      createdAt: new Date().toISOString(),
      contributor: { id: "currentUser", name: "You" },
    };
    dummySubmissions.unshift(newSubmission);
    return res(ctx.delay(300), ctx.json(newSubmission));
  }),

  // Update submission status
  rest.put("/api/content/:id/status", async (req, res, ctx) => {
    const { id } = req.params;
    const { status } = await req.json();

    const submission = dummySubmissions.find((sub) => sub.id === id);
    if (submission) submission.status = status;

    return res(ctx.delay(200), ctx.json(submission || {}));
  }),

  // Get version history
  rest.get("/api/content/:id/versions", (req, res, ctx) => {
    return res(ctx.delay(100), ctx.json(dummyVersions));
  }),

  // Rollback version
  rest.post("/api/content/:id/rollback", async (req, res, ctx) => {
    const { versionId } = await req.json();
    const version = dummyVersions.find((v) => v.id === versionId);

    if (version) {
      // In a real app, this would create a new version with the old content
      version.isCurrent = true;
      dummyVersions.forEach((v) => {
        if (v.id !== versionId) v.isCurrent = false;
      });
    }

    return res(ctx.delay(300), ctx.json(version || {}));
  }),

  // Get contributors
  rest.get("/api/contributors", (req, res, ctx) => {
    return res(ctx.delay(100), ctx.json(dummyContributors));
  }),
];
