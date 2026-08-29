import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { GroupScopedRequest } from "../middleware/requireGroupRole";
import { selectTiffinSchema } from "../validators/tiffin.validators";
import * as tiffinService from "../services/tiffin.service";
import { todayISODate } from "../utils/date";

export const selectToday = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const input = selectTiffinSchema.parse(req.body);
  console.log("input : " , input);

  
  const record = await tiffinService.selectTodayTiffin(
    req.params.id,
    req.userId as string,
    input.type,
    false,
    input.date
  );
  res.status(200).json({ record });
});

// Admin-only override for another member's selection
export const overrideSelection = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const input = selectTiffinSchema.parse(req.body);
  const targetUserId = req.params.userId;
  const record = await tiffinService.selectTodayTiffin(
    req.params.id,
    targetUserId,
    input.type,
    true,
    input.date
  );
  res.status(200).json({ record });
});

export const getToday = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const record = await tiffinService.getTodayRecord(req.params.id, req.userId as string);
  res.status(200).json({ record });
});

export const getTodayOrder = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const date = (req.query.date as string) ?? todayISODate();
  const order = await tiffinService.getGroupOrderForDate(req.params.id, date);
  res.status(200).json(order);
});

export const getHistory = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  // const { date, userId, type } = req.query as { date?: string; userId?: string; type?: any };
  console.log("reuest : " , req.userId);
  const records = await tiffinService.getGroupHistory(req.params.id , req.userId);

  res.status(200).json({ records });
});

export const getCalendarSummary = asyncHandler(async (req: GroupScopedRequest, res: Response) => {
  const month = (req.query.month as string) ?? todayISODate().slice(0, 7);
  const days = await tiffinService.getMonthCalendarSummary(req.params.id, month);
  res.status(200).json({ month, days });
});