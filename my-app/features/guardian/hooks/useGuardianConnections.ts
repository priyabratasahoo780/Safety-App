import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import { GuardianRequest, GuardianConnection, guardianService } from '../services/guardianService';

export const useGuardianConnections = (currentUserId: string | null) => {
  const [pendingIncoming, setPendingIncoming] = useState<GuardianRequest[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<GuardianRequest[]>([]);
  const [activeConnections, setActiveConnections] = useState<GuardianConnection[]>([]);
  
  // We'll map connection IDs to user details to display nice names/avatars
  const [guardianProfiles, setGuardianProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!currentUserId) return;

    // Listen to incoming requests (someone wants to connect with me as Guardian)
    const qIncoming = query(
      collection(db, 'guardianRequests'),
      where('receiverUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );
    const unsubIncoming = onSnapshot(qIncoming, async (snapshot) => {
      const reqs: GuardianRequest[] = [];
      const newProfiles = { ...guardianProfiles };

      for (const docSnapshot of snapshot.docs) {
        const req = docSnapshot.data() as GuardianRequest;
        reqs.push(req);
        
        if (!newProfiles[req.requesterUserId]) {
          const p = await getDoc(doc(db, 'users', req.requesterUserId));
          if (p.exists()) {
            newProfiles[req.requesterUserId] = p.data();
          }
        }
      }
      
      setGuardianProfiles(prev => ({ ...prev, ...newProfiles }));
      setPendingIncoming(reqs);
    });

    // Listen to outgoing requests
    const qOutgoing = query(
      collection(db, 'guardianRequests'),
      where('requesterUserId', '==', currentUserId),
      where('status', '==', 'pending')
    );
    const unsubOutgoing = onSnapshot(qOutgoing, (snapshot) => {
      const reqs: GuardianRequest[] = [];
      snapshot.forEach((doc) => reqs.push(doc.data() as GuardianRequest));
      setPendingOutgoing(reqs);
    });

    // Listen to active connections (I am the protected user, these are my guardians)
    const qConnections = query(
      collection(db, 'guardianConnections'),
      where('protectedUserId', '==', currentUserId),
      where('status', '==', 'active')
    );
    
    const unsubConnections = onSnapshot(qConnections, async (snapshot) => {
      const conns: GuardianConnection[] = [];
      const newProfiles = { ...guardianProfiles };
      
      for (const docSnapshot of snapshot.docs) {
        const conn = docSnapshot.data() as GuardianConnection;
        conns.push(conn);
        
        if (!newProfiles[conn.guardianUserId]) {
          const p = await getDoc(doc(db, 'users', conn.guardianUserId));
          if (p.exists()) {
            newProfiles[conn.guardianUserId] = p.data();
          }
        }
      }
      
      setGuardianProfiles(prev => ({ ...prev, ...newProfiles }));
      setActiveConnections(conns);
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
      unsubConnections();
    };
  }, [currentUserId]);

  const sendRequest = async (receiverId: string, requesterName: string) => {
    if (!currentUserId) return;
    return await guardianService.sendGuardianRequest(currentUserId, requesterName, receiverId);
  };

  const acceptRequest = async (requestId: string, requesterId: string) => {
    if (!currentUserId) return;
    return await guardianService.acceptGuardianRequest(requestId, currentUserId, requesterId);
  };

  const rejectRequest = async (requestId: string) => {
    return await guardianService.rejectGuardianRequest(requestId);
  };

  return {
    pendingIncoming,
    pendingOutgoing,
    activeConnections,
    guardianProfiles,
    sendRequest,
    acceptRequest,
    rejectRequest,
  };
};
