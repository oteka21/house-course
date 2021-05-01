import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "src/auth/useAuth";
// import { DeleteHouse, DeleteHouseVariables } from "src/generated/DeleteHouse";

interface Iprops {
  house: {
    id: string;
    userId: string;
  };
}

export default function HouseNav({ house }: Iprops) {
  const { user } = useAuth();
  const canManage = !!user && user.uid === house.userId;
  return (
    <>
      <Link href="/">
        <a>map</a>
      </Link>
      {canManage && (
        <>
          {" | "}
          <Link href={`/houses/${house.id}/edit`}>Edit</Link>
        </>
      )}
    </>
  );
}
