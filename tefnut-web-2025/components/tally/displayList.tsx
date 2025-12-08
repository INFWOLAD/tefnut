import { bankCodeTrans } from "@/utils/tallyBankCode";
import { Card, CardContent } from "../ui/card";
import { Text } from "../ui/text";

interface DisplayListProps {
  item: any;
}

export default function DisplayList({ item }: DisplayListProps) {
  return (
    <>
      <CardContent>
        <Text>{bankCodeTrans(item.bankShort)}</Text>
      </CardContent>
    </>
  );
}
