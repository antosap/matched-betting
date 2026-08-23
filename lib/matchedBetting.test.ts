import { describe, expect, it } from "vitest";
import {
  calculateMatchedBet,
  calculateFreeBet,
} from "./matchedBetting";

describe("calculateMatchedBet", () => {
  it("calcola correttamente un matched bet senza commissione", () => {
    const result = calculateMatchedBet({
      backOdds: 2,
      layOdds: 2,
      backStake: 100,
      commissionPct: 0,
    });

    expect(result.layStake).toBeCloseTo(100, 2);
    expect(result.liability).toBeCloseTo(100, 2);

    expect(result.backWinProfit).toBeCloseTo(0, 2);
    expect(result.backLoseProfit).toBeCloseTo(0, 2);

    expect(result.guaranteedProfit).toBeCloseTo(0, 2);
    expect(result.roiPct).toBeCloseTo(0, 2);
  });

  it("bilancia correttamente un matched bet con commissione", () => {
    const result = calculateMatchedBet({
      backOdds: 2.1,
      layOdds: 2.04,
      backStake: 100,
      commissionPct: 2,
    });

    expect(result.layStake).toBeCloseTo(103.96, 1);
    expect(result.liability).toBeCloseTo(108.12, 1);

    expect(result.backWinProfit).toBeCloseTo(
      result.backLoseProfit,
      2
    );

    expect(result.guaranteedProfit).toBeGreaterThan(0);
    expect(result.roiPct).toBeGreaterThan(0);
  });

  it("mantiene gli alias compatibili con la UI", () => {
    const result = calculateMatchedBet({
      backOdds: 2.1,
      layOdds: 2.04,
      backStake: 100,
      commissionPct: 2,
    });

    expect(result.backProfitIfWin).toBe(
      result.backWinProfit
    );

    expect(result.layProfitIfWin).toBe(
      result.backLoseProfit
    );

    expect(result.netProfit).toBe(
      result.guaranteedProfit
    );
  });

  it("rifiuta quote Back non valide", () => {
    expect(() =>
      calculateMatchedBet({
        backOdds: 1,
        layOdds: 2,
        backStake: 100,
        commissionPct: 2,
      })
    ).toThrow();
  });

  it("rifiuta quote Lay non valide", () => {
    expect(() =>
      calculateMatchedBet({
        backOdds: 2,
        layOdds: 1,
        backStake: 100,
        commissionPct: 2,
      })
    ).toThrow();
  });

  it("rifiuta stake negativo o zero", () => {
    expect(() =>
      calculateMatchedBet({
        backOdds: 2,
        layOdds: 2,
        backStake: 0,
        commissionPct: 2,
      })
    ).toThrow();
  });

  it("rifiuta commissione negativa", () => {
    expect(() =>
      calculateMatchedBet({
        backOdds: 2,
        layOdds: 2,
        backStake: 100,
        commissionPct: -1,
      })
    ).toThrow();

  });

  it("rifiuta commissione uguale o superiore al 100%", () => {
    expect(() =>
      calculateMatchedBet({
        backOdds: 2,
        layOdds: 2,
        backStake: 100,
        commissionPct: 100,
      })
    ).toThrow();
  });
});

describe("calculateFreeBet", () => {
  it("calcola una Free Bet SNR", () => {
    const result = calculateFreeBet({
      freeBetStake: 100,
      backOdds: 2,
      layOdds: 1.98,
      commissionPct: 2,
      stakeReturned: false,
    });

    expect(result.layStake).toBeGreaterThan(0);
    expect(result.liability).toBeGreaterThan(0);

    expect(result.guaranteedProfit).toBeGreaterThan(0);
    expect(result.conversionPct).toBeGreaterThan(0);
  });

  it("calcola una Free Bet SR", () => {
    const result = calculateFreeBet({
      freeBetStake: 100,
      backOdds: 2,
      layOdds: 1.98,
      commissionPct: 2,
      stakeReturned: true,
    });

    expect(result.layStake).toBeGreaterThan(0);
    expect(result.liability).toBeGreaterThan(0);

    expect(result.guaranteedProfit).toBeGreaterThan(0);
    expect(result.conversionPct).toBeGreaterThan(0);
  });

  it("una Free Bet SR produce un risultato diverso da SNR", () => {
    const snr = calculateFreeBet({
      freeBetStake: 100,
      backOdds: 2,
      layOdds: 1.98,
      commissionPct: 2,
      stakeReturned: false,
    });

    const sr = calculateFreeBet({
      freeBetStake: 100,
      backOdds: 2,
      layOdds: 1.98,
      commissionPct: 2,
      stakeReturned: true,
    });

    expect(sr.guaranteedProfit).not.toBe(
      snr.guaranteedProfit
    );
  });

  it("rifiuta una Free Bet con stake non valido", () => {
    expect(() =>
      calculateFreeBet({
        freeBetStake: 0,
        backOdds: 2,
        layOdds: 1.98,
        commissionPct: 2,
        stakeReturned: false,
      })
    ).toThrow();
  });

  it("rifiuta quote Free Bet non valide", () => {
    expect(() =>
      calculateFreeBet({
        freeBetStake: 100,
        backOdds: 1,
        layOdds: 1.98,
        commissionPct: 2,
        stakeReturned: false,
      })
    ).toThrow();
  });

  it("rifiuta valori NaN o Infinity", () => {
    expect(() =>
      calculateFreeBet({
        freeBetStake: NaN,
        backOdds: 2,
        layOdds: 1.98,
        commissionPct: 2,
        stakeReturned: false,
      })
    ).toThrow();

    expect(() =>
      calculateMatchedBet({
        backOdds: Infinity,
        layOdds: 2,
        backStake: 100,
        commissionPct: 2,
      })
    ).toThrow();
  });
});
