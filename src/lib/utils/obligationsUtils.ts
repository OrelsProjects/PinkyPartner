import axios from "axios";
import { Logger } from "@/logger";
import {
  GetNextUpObligationsResponse,
  UserContractObligationData,
} from "../../models/userContractObligation";
import { setLoadingData } from "../features/contracts/contractsSlice";
import { setPartnersData } from "../features/obligations/obligationsSlice";

type PartnersData = {
  partnerId: string;
  contractObligations: UserContractObligationData[];
}[];

export type FetchNextUpObligationsResponse = {
  userContractObligations: UserContractObligationData[];
  partnersData: PartnersData;
};

export const fetchNextUpObligations =
  async (): Promise<FetchNextUpObligationsResponse> => {
    try {
      const response = await axios.get<GetNextUpObligationsResponse>(
        "/api/obligations/next-up",
      );
      const { userContractObligations, partnersContractObligations } =
        response.data;
      const partnersData = partnersContractObligations.map(partnerData => ({
        partnerId: partnerData.partnerId,
        contractObligations: partnerData.contractObligations,
      }));

      return {
        userContractObligations,
        partnersData,
      };

      //   setUserContractObligations(userContractObligations);
      //   setPartnersData(partnersData);
    } catch (error: any) {
      Logger.error("Failed to fetch next up obligations", error);
      throw error;
    } finally {
      setLoadingData(false);
    }
  };
