import React from 'react';
import { motion } from 'framer-motion';
import { UserContractObligationData } from '@/lib/models/userContractObligation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getWeekRangeFormatted, daysOfWeek } from '@/lib/utils/dateUtils';
import { FaBell, FaTrophy } from 'react-icons/fa';
import Contract from '@/lib/models/contract';

interface ObligationsListProps {
  userData: UserContractObligationData[];
  partnerData: UserContractObligationData[];
  contracts: Contract[];
  onCompleteObligation: (obligationId: string, day: string, completed: boolean) => void;
  onNudgePartner: (contractId: string) => void;
}

export const ObligationsList: React.FC<ObligationsListProps> = ({
  userData,
  partnerData,
  contracts,
  onCompleteObligation,
  onNudgePartner,
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
      <div className="space-y-8">
        {contracts.map((contract) => (
          <Card key={contract.contractId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">{contract.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => onNudgePartner(contract.contractId)}
                >
                  <FaBell className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-white/80">{getWeekRangeFormatted()}</p>
            </CardHeader>
            <CardContent className="p-6">
              {userData
                .filter((obligation) => obligation.contract.contractId === contract.contractId)
                .map((obligation) => (
                  <ObligationItem
                    key={obligation.obligationId}
                    obligation={obligation}
                    partnerObligation={partnerData.find(
                      (po) =>
                        po.obligationId === obligation.obligationId &&
                        po.contract.contractId === contract.contractId
                    )}
                    onComplete={onCompleteObligation}
                  />
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

interface ObligationItemProps {
  obligation: UserContractObligationData;
  partnerObligation?: UserContractObligationData;
  onComplete: (obligationId: string, day: string, completed: boolean) => void;
}

const ObligationItem: React.FC<ObligationItemProps> = ({ obligation, partnerObligation, onComplete }) => {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-lg font-semibold mb-2">
        {obligation.obligation.emoji} {obligation.obligation.title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {obligation.obligation.days.map((dayIndex) => {
          const day = daysOfWeek[dayIndex];
          const isCompleted = obligation.completedAt !== null;
          const isPartnerCompleted = partnerObligation?.completedAt !== null;

          return (
            <motion.div
              key={day}
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className={`h-full ${isCompleted ? 'bg-primary/10' : ''}`}>
                <CardContent className="p-4 flex flex-col items-center justify-between h-full">
                  <p className="text-sm font-medium mb-2">{day}</p>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => onComplete(obligation.obligationId, day, checked as boolean)}
                    className="h-6 w-6"
                  />
                  <div className="flex justify-center mt-2 space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={obligation.appUser.photoURL || undefined} />
                      <AvatarFallback>{obligation.appUser.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                    {partnerObligation && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partnerObligation.appUser.photoURL || undefined} />
                        <AvatarFallback>{partnerObligation.appUser.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
              {isCompleted && isPartnerCompleted && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <FaTrophy className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ObligationsList;

