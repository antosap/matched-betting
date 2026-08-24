import { describe, expect, it } from "vitest";
import { calculateOpportunity } from "./opportunityCalculator";
import type { ProviderQuote } from "@/lib/providers/types";

const back:ProviderQuote={
  id:"back-1",eventId:"event-1",event:"Test Event",market:"1X2",
  selection:"Home",side:"BACK",odds:2.1,bookmakerId:"book-1",
  bookmakerName:"Bookmaker",timestamp:"2026-08-23T12:00:00Z",
  sourceProviderId:"test"
};
const lay:ProviderQuote={
  id:"lay-1",eventId:"event-1",event:"Test Event",market:"1X2",
  selection:"Home",side:"LAY",odds:2.04,exchangeId:"exchange-1",
  exchangeName:"Exchange",timestamp:"2026-08-23T12:00:00Z",
  sourceProviderId:"test"
};

describe("calculateOpportunity",()=>{
  it("creates a profitable opportunity",()=>{
    const result=calculateOpportunity(back,lay,2);
    expect(result).not.toBeNull();
    expect(result?.roi).toBeGreaterThan(0);
  });
  it("rejects different events",()=>{
    expect(calculateOpportunity(back,{...lay,eventId:"event-2"},2)).toBeNull();
  });
  it("rejects invalid odds",()=>{
    expect(calculateOpportunity({...back,odds:1},lay,2)).toBeNull();
  });
});
