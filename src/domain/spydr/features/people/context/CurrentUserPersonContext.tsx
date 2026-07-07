import { createContext, useCallback, useContext, useMemo } from "react";
import { useUser } from "@clerk/react";
import { usePeopleQuery } from "@/domain/spydr/features/shared/hooks/queries";
import { useOrganizationContext } from "@/domain/spydr/features/organizations/context/OrganizationContext";
import type { PersonNode } from "@/domain/spydr/utils/types";
import {
  collectClerkEmails,
  findCurrentUserPerson,
  personMatchesEmails,
} from "../utils/matchCurrentUserPerson";

interface CurrentUserPersonContextValue {
  clerkEmails: string[];
  primaryClerkEmail: string | null;
  clerkUserId: string | null;
  currentUserPerson: PersonNode | null;
  currentUserPersonId: string | null;
  isReady: boolean;
  isMe: (personOrId: PersonNode | string | null | undefined) => boolean;
}

const CurrentUserPersonContext = createContext<CurrentUserPersonContextValue | null>(
  null
);

export function CurrentUserPersonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isReady: isOrgReady } = useOrganizationContext();
  const peopleQuery = usePeopleQuery();

  const clerkEmails = useMemo(
    () =>
      collectClerkEmails(
        user?.primaryEmailAddress?.emailAddress,
        user?.emailAddresses.map((entry) => entry.emailAddress) ?? []
      ),
    [user?.emailAddresses, user?.primaryEmailAddress?.emailAddress]
  );

  const currentUserPerson = useMemo(
    () => findCurrentUserPerson(peopleQuery.data ?? [], clerkEmails),
    [clerkEmails, peopleQuery.data]
  );

  const isMe = useCallback(
    (personOrId: PersonNode | string | null | undefined) => {
      if (!personOrId) return false;

      if (typeof personOrId === "string") {
        return currentUserPerson?.id === personOrId;
      }

      if (currentUserPerson?.id === personOrId.id) return true;
      return personMatchesEmails(personOrId, clerkEmails);
    },
    [clerkEmails, currentUserPerson?.id]
  );

  const value = useMemo<CurrentUserPersonContextValue>(
    () => ({
      clerkEmails,
      primaryClerkEmail: clerkEmails[0] ?? null,
      clerkUserId: user?.id ?? null,
      currentUserPerson,
      currentUserPersonId: currentUserPerson?.id ?? null,
      isReady:
        isUserLoaded &&
        isOrgReady &&
        !peopleQuery.isLoading &&
        Boolean(user),
      isMe,
    }),
    [
      clerkEmails,
      currentUserPerson,
      isMe,
      isOrgReady,
      isUserLoaded,
      peopleQuery.isLoading,
      user,
    ]
  );

  return (
    <CurrentUserPersonContext.Provider value={value}>
      {children}
    </CurrentUserPersonContext.Provider>
  );
}

export function useCurrentUserPerson() {
  const context = useContext(CurrentUserPersonContext);
  if (!context) {
    throw new Error(
      "useCurrentUserPerson must be used within CurrentUserPersonProvider"
    );
  }
  return context;
}
