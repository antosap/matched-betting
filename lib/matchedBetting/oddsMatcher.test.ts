import { describe, expect, it } from "vitest";
import { findMatchedOpportunities } from "./oddsMatcher";
import type { ProviderQuote } from "@/lib/providers/types";

const quote=(overrides:Partial<ProviderQuote>):ProviderQuote=>({
  id:"quote",eventId:"event-1",event:"Milan - Roma",market:"1X2",
  selection:"Milan",side:"BACK",odds:2.1,bookmakerId:"bookmaker-1",
  bookmakerName:"Bookmaker",timestamp:"2026-08-24T12:00:00Z",
  sourceProviderId:"test-provider",...overrides
});

describe("findMatchedOpportunities",()=>{
  it("matches compatible BACK and LAY quotes",()=>{
    const result=findMatchedOpportunities([
      quote({id:"back-1"}),
      quote({id:"lay-1",side:"LAY",odds:2.04,bookmakerId:undefined,bookmakerName:undefined,exchangeId:"exchange-1",exchangeName:"Exchange"})
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].estimatedProfit).toBeGreaterThan(0);
  });
  it("does not match different events",()=>{
    const result=findMatchedOpportunities([
      quote({id:"back-1"}),
      quote({id:"lay-1",eventId:"event-2",side:"LAY",bookmakerId:undefined,bookmakerName:undefined,exchangeId:"exchange-1"})
    ]);
    expect(result).toHaveLength(0);
  });
  it("sorts by ROI descending",()=>{
    const result=findMatchedOpportunities([
      quote({id:"back-1",odds:2.1}),
      quote({id:"lay-1",side:"LAY",odds:2.04,bookmakerId:undefined,bookmakerName:undefined,exchangeId:"exchange-1"}),
      quote({id:"back-2",eventId:"event-2",odds:2.5}),
      quote({id:"lay-2",eventId:"event-2",side:"LAY",odds:2.1,bookmakerId:undefined,bookmakerName:undefined,exchangeId:"exchange-2"})
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].roi).toBeGreaterThan(result[1].roi);
  });
});
