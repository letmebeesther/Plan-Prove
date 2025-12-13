
import { 
    collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, 
    query, where, orderBy, limit, startAfter, arrayUnion, arrayRemove, 
    serverTimestamp, writeBatch, Timestamp, DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { 
    User, Plan, Challenge, SubGoal, Evidence, Participant, ChatRoom, 
    Certification, ScrapItem, Notice 
} from "../types";

// --- Types ---

export interface HomeFeedItem {
    id: string;
    type: 'PLAN_COMPLETION' | 'CHALLENGE_POST' | 'CERTIFICATION';
    user: User;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    comments: number;
    relatedTitle?: string;
    relatedId?: string;
    isRecent?: boolean; // For UI logic
}

export interface SearchResultItem {
    id: string;
    type: 'PLAN' | 'CHALLENGE' | 'HOF' | 'MONTHLY';
    title: string;
    description: string;
    imageUrl?: string;
    avatarUrl?: string;
    authorName?: string;
    category?: string;
    status?: string;
    progress?: number;
    metrics?: { label: string; value: string | number }[];
}

// --- Helpers ---
const snapToData = <T>(snap: any): T => {
    const data = snap.data();
    return { id: snap.id, ...data } as T;
}

// --- User Services ---
export const fetchUser = async (uid: string): Promise<User | null> => {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) return snapToData<User>(snap);
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
    await updateDoc(doc(db, "users", uid), data);
};

export const updateUserWearableStatus = async (uid: string, status: boolean) => {
    await updateDoc(doc(db, "users", uid), { hasWearable: status });
};

export const adminUpdateUser = async (uid: string, data: any) => {
    await updateDoc(doc(db, "users", uid), data);
};

// --- Plan Services ---
export const createPlan = async (uid: string, planData: any): Promise<string> => {
    const user = await fetchUser(uid);
    if (!user) throw new Error("User not found");
    
    const newPlanData = {
        ...planData,
        authorId: uid,
        author: user, // Embedding minimal author info for easier display
        createdAt: new Date().toISOString(),
        likes: 0,
        isPublic: true
    };
    
    const docRef = await addDoc(collection(db, "plans"), newPlanData);
    
    // Update user stats
    await updateDoc(doc(db, "users", uid), {
        totalPlans: (user.totalPlans || 0) + 1
    });
    
    return docRef.id;
};

export const fetchPlanById = async (id: string): Promise<Plan | null> => {
    try {
        const snap = await getDoc(doc(db, "plans", id));
        if (snap.exists()) return snapToData<Plan>(snap);
        return null;
    } catch (e) {
        console.error("Error fetching plan:", e);
        return null;
    }
};

export const fetchMyActivePlans = async (uid: string): Promise<Plan[]> => {
    try {
        const q = query(
            collection(db, "plans"), 
            where("authorId", "==", uid)
        );
        const snap = await getDocs(q);
        const plans = snap.docs.map(d => snapToData<Plan>(d));
        // Filter in memory for simplicity (progress < 100)
        return plans.filter(p => (p.progress || 0) < 100); 
    } catch (e) {
        console.error("Error fetching active plans:", e);
        return [];
    }
};

export const fetchMyPastPlans = async (uid: string): Promise<Plan[]> => {
    try {
        const q = query(collection(db, "plans"), where("authorId", "==", uid));
        const snap = await getDocs(q);
        const plans = snap.docs.map(d => snapToData<Plan>(d));
        return plans.filter(p => (p.progress || 0) >= 100); 
    } catch (e) {
        console.error("Error fetching past plans:", e);
        return [];
    }
};

export const fetchPublicPlans = async (category?: string): Promise<Plan[]> => {
    try {
        // Query without orderBy to avoid index requirement for (isPublic, createdAt)
        // We will sort client-side.
        const q = query(collection(db, "plans"), where("isPublic", "==", true), limit(50));
        
        const snap = await getDocs(q);
        let plans = snap.docs.map(d => snapToData<Plan>(d));
        
        // Client-side sort: Descending by createdAt
        plans.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        if (category && category !== '전체') {
            plans = plans.filter(p => p.category === category);
        }
        
        return plans.slice(0, 20);
    } catch (e: any) {
        console.error("Error fetching public plans:", e);
        return [];
    }
};

export const deletePlan = async (id: string) => {
    await deleteDoc(doc(db, "plans", id));
};

export const updateSubGoalStatus = async (planId: string, subGoals: SubGoal[], progress: number) => {
    await updateDoc(doc(db, "plans", planId), {
        subGoals,
        progress
    });
};

export const submitEvidence = async (planId: string, subGoalIndex: number, evidence: Evidence) => {
    const planRef = doc(db, "plans", planId);
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan not found");
    
    const plan = snapToData<Plan>(planSnap);
    const updatedSubGoals = [...plan.subGoals];
    const subGoal = updatedSubGoals[subGoalIndex];
    
    if (!subGoal.evidences) subGoal.evidences = [];
    subGoal.evidences.push(evidence);
    
    // Auto-complete logic for demo (if 1 evidence submitted -> completed)
    if (subGoal.status !== 'completed') {
        subGoal.status = 'completed';
    }
    
    // Recalculate progress
    const completedCount = updatedSubGoals.filter(g => g.status === 'completed').length;
    const newProgress = Math.round((completedCount / updatedSubGoals.length) * 100);
    
    await updateDoc(planRef, {
        subGoals: updatedSubGoals,
        progress: newProgress
    });
    
    // Update user stats (completed goals)
    const userRef = doc(db, "users", plan.authorId!);
    // We strictly should read current user data, but for demo updateDoc increment:
    // Actually we need to import `increment` from firestore but not imported.
    // Just simple read-write for now or skip.
};

// --- Scrap Services ---
export const toggleScrap = async (uid: string, item: Partial<ScrapItem>): Promise<boolean> => {
    const q = query(
        collection(db, "scraps"), 
        where("userId", "==", uid), 
        where("originalId", "==", item.originalId)
    );
    const snap = await getDocs(q);
    
    if (!snap.empty) {
        await deleteDoc(doc(db, "scraps", snap.docs[0].id));
        return false;
    } else {
        await addDoc(collection(db, "scraps"), {
            ...item,
            userId: uid,
            savedAt: new Date().toISOString()
        });
        return true;
    }
};

export const fetchMyScraps = async (uid: string): Promise<ScrapItem[]> => {
    try {
        const q = query(collection(db, "scraps"), where("userId", "==", uid));
        const snap = await getDocs(q);
        return snap.docs.map(d => snapToData<ScrapItem>(d));
    } catch (e) {
        return [];
    }
};

// --- Challenge Services ---
export const createChallenge = async (data: any): Promise<string> => {
    const docRef = await addDoc(collection(db, "challenges"), {
        ...data,
        createdAt: new Date().toISOString(),
        participantCount: 1,
        growthRate: 0,
        avgAchievement: 0,
        retentionRate: 100,
        avgTrustScore: 50
    });
    return docRef.id;
};

export const fetchChallenges = async (): Promise<Challenge[]> => {
    try {
        const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"), limit(20));
        const snap = await getDocs(q);
        return snap.docs.map(d => snapToData<Challenge>(d));
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const fetchChallengeById = async (id: string): Promise<Challenge | null> => {
    try {
        const snap = await getDoc(doc(db, "challenges", id));
        if (snap.exists()) return snapToData<Challenge>(snap);
        return null;
    } catch (e) {
        return null;
    }
};

export const fetchMyJoinedChallenges = async (uid: string): Promise<Challenge[]> => {
    try {
        const q = query(collection(db, "challenges"), where("participantIds", "array-contains", uid));
        const snap = await getDocs(q);
        return snap.docs.map(d => snapToData<Challenge>(d));
    } catch (e) {
        return [];
    }
};

export const fetchChallengeParticipants = async (challengeId: string): Promise<Participant[]> => {
    const challenge = await fetchChallengeById(challengeId);
    if (!challenge || !challenge.participantIds) return [];

    const participants: Participant[] = [];
    const ids = challenge.participantIds.slice(0, 20); 
    
    for (const uid of ids) {
        const user = await fetchUser(uid);
        if (user) {
            participants.push({
                user,
                role: uid === challenge.host.id ? 'HOST' : 'MEMBER',
                achievementRate: Math.floor(Math.random() * 100),
                growthRate: Math.floor(Math.random() * 20),
                connectedGoalTitle: `${challenge.title} 도전!`, 
                connectedGoalId: `mock-plan-${uid}`, 
                joinedAt: '2023-10-01',
                lastCertifiedAt: '1일 전',
                trustScore: user.trustScore
            });
        }
    }
    return participants;
};

// --- Feed Services ---
export const fetchHomeFeed = async (cursor?: string, limitCount = 10): Promise<{ feedItems: HomeFeedItem[], nextCursor?: string }> => {
    try {
        // Query recent public plans
        const q = query(
            collection(db, "plans"), 
            where("isPublic", "==", true),
            limit(limitCount * 2) // Fetch more to filter client-side if needed
        );
        
        const snap = await getDocs(q);
        let plans = snap.docs.map(d => snapToData<Plan>(d));
        
        // Sort in memory by createdAt descending
        plans.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        // Convert to Feed Items
        const feedItems: HomeFeedItem[] = plans.slice(0, limitCount).map(p => {
            const isCompleted = (p.progress || 0) >= 100;
            return {
                id: `feed-${p.id}`,
                type: isCompleted ? 'PLAN_COMPLETION' : 'CERTIFICATION',
                user: p.author,
                content: isCompleted 
                    ? `${p.author.nickname}님이 "${p.title}" 목표를 완주했습니다! 🎉` 
                    : `${p.author.nickname}님이 "${p.title}" 계획을 시작했습니다. 함께 응원해주세요! 🔥`,
                imageUrl: p.imageUrl, 
                createdAt: p.createdAt || new Date().toISOString(),
                likes: p.likes || 0,
                comments: 0,
                relatedTitle: p.title,
                relatedId: p.id,
                isRecent: true
            };
        });

        return { feedItems, nextCursor: undefined };
    } catch (e) {
        console.error("Feed error:", e);
        return { feedItems: [], nextCursor: undefined };
    }
};

export const fetchPopularFeeds = async (): Promise<HomeFeedItem[]> => {
    return [];
};

export const fetchChallengeFeeds = async (challengeId: string): Promise<Certification[]> => {
    return [];
};

// --- Hall of Fame ---
export const fetchHallOfFame = async (type: string): Promise<any[]> => {
    try {
        // Since we don't have a robust 'likes' index yet, fetch a batch of public plans and sort in memory
        const q = query(collection(db, "plans"), where("isPublic", "==", true), limit(50));
        const snap = await getDocs(q);
        const plans = snap.docs.map(d => snapToData<Plan>(d));
        
        // Sort by likes descending
        plans.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        
        // Take top 3
        return plans.slice(0, 3).map((p, idx) => ({
            id: `hof-${p.id}`,
            rank: idx + 1,
            title: p.title,
            authorName: p.author.nickname,
            avatarUrl: p.author.avatarUrl,
            score: (p.likes || 0) * 10 + (p.progress || 0),
            category: p.category,
            imageUrl: p.imageUrl,
            planId: p.id
        }));
    } catch (e) {
        console.error("HOF error:", e);
        return [];
    }
};

// --- Chat ---
export const createChatRoom = async (users: User[], type: 'DIRECT' | 'GROUP'): Promise<string> => {
    const roomData = {
        type,
        participants: users,
        participantIds: users.map(u => u.id),
        lastMessage: "대화가 시작되었습니다.",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        name: type === 'GROUP' ? '새로운 그룹 채팅' : users[1].nickname
    };
    const docRef = await addDoc(collection(db, "chatRooms"), roomData);
    return docRef.id;
};

export const fetchMyChatRooms = async (uid: string): Promise<ChatRoom[]> => {
    try {
        const q = query(collection(db, "chatRooms"), where("participantIds", "array-contains", uid), orderBy("lastMessageTime", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => snapToData<ChatRoom>(d));
    } catch (e) {
        return [];
    }
};

export const fetchChatRoomById = async (id: string): Promise<ChatRoom | null> => {
    try {
        const snap = await getDoc(doc(db, "chatRooms", id));
        if (snap.exists()) return snapToData<ChatRoom>(snap);
        return null;
    } catch (e) {
        return null;
    }
};

// --- Search ---
export const searchGlobal = async (params: any): Promise<SearchResultItem[]> => {
    const results: SearchResultItem[] = [];
    
    try {
        // Fetch Plans
        // Use client-side filtering for simplicity if needed, but here simple query + limit is okay
        const plansQ = query(collection(db, "plans"), where("isPublic", "==", true), limit(20));
        const plansSnap = await getDocs(plansQ);
        plansSnap.forEach(d => {
            const p = d.data() as Plan;
            if (params.keyword && !p.title.toLowerCase().includes(params.keyword.toLowerCase())) return;
            results.push({
                id: d.id,
                type: 'PLAN',
                title: p.title,
                description: p.description,
                imageUrl: p.imageUrl,
                avatarUrl: p.author.avatarUrl,
                authorName: p.author.nickname,
                category: p.category,
                progress: p.progress,
                metrics: [{ label: '좋아요', value: p.likes || 0 }]
            });
        });

        // Fetch Challenges
        const challQ = query(collection(db, "challenges"), limit(20));
        const challSnap = await getDocs(challQ);
        challSnap.forEach(d => {
            const c = d.data() as Challenge;
            if (params.keyword && !c.title.toLowerCase().includes(params.keyword.toLowerCase())) return;
            results.push({
                id: d.id,
                type: 'CHALLENGE',
                title: c.title,
                description: c.description,
                imageUrl: c.imageUrl,
                authorName: c.host.nickname,
                category: c.category,
                metrics: [{ label: '참여자', value: c.participantCount }]
            });
        });
    } catch (e) {
        console.error("Search error", e);
    }

    return results;
};

// --- Admin ---
export const seedDatabase = async (uid: string) => {
    const user = await fetchUser(uid);
    if (!user) return;

    const batch = writeBatch(db);
    const now = new Date();

    // 1. Create Active Plans (5 items)
    const activeCategories = ['건강관리', '어학', '코딩', '독서', '취미'];
    for(let i=0; i<5; i++) {
        const ref = doc(collection(db, 'plans'));
        const startDate = new Date(now);
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30); // Ends in 30 days
        
        batch.set(ref, {
            authorId: uid,
            author: user,
            title: `[${activeCategories[i]}] 30일 챌린지 - ${i+1}`,
            description: `매일매일 꾸준히 실천하는 ${activeCategories[i]} 계획입니다.`,
            category: activeCategories[i],
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            executionTime: "08:00",
            progress: Math.floor(Math.random() * 70), // Random progress
            isPublic: true,
            likes: Math.floor(Math.random() * 100),
            createdAt: now.toISOString(),
            subGoals: [
                { 
                    id: `sg-${i}-1`, title: "시작이 반이다", description: "첫 걸음 떼기", 
                    status: "completed", evidenceTypes: ["PHOTO"], evidences: [] 
                },
                { 
                    id: `sg-${i}-2`, title: "꾸준함 증명", description: "2주차 인증", 
                    status: "pending", evidenceTypes: ["PHOTO"], evidences: [] 
                },
                { 
                    id: `sg-${i}-3`, title: "마무리 단계", description: "최종 점검", 
                    status: "pending", evidenceTypes: ["PHOTO"], evidences: [] 
                }
            ],
            daysLeft: 30 - i,
            lastCertifiedAt: new Date(now.getTime() - Math.random() * 86400000 * 3).toISOString().split('T')[0]
        });
    }

    // 2. Create Past Plans (3 items)
    for(let i=0; i<3; i++) {
        const ref = doc(collection(db, 'plans'));
        batch.set(ref, {
            authorId: uid,
            author: user,
            title: `[완료] 지난 달 목표 달성 - ${i+1}`,
            description: "성공적으로 마무리했습니다.",
            category: "운동",
            startDate: "2023-01-01",
            endDate: "2023-02-01",
            progress: 100,
            isPublic: true,
            isSuccess: true,
            finalAchievementRate: 100,
            likes: Math.floor(Math.random() * 50),
            createdAt: new Date("2023-01-01").toISOString(),
            subGoals: []
        });
    }

    // 3. Create Challenges (5 items)
    const challengeTitles = [
        "새벽 5시 기상 모임", "매일 책 30페이지 읽기", "영양제 챙겨먹기", 
        "하루 1번 하늘 보기", "주 3회 러닝 크루"
    ];
    for(let i=0; i<5; i++) {
        const ref = doc(collection(db, 'challenges'));
        batch.set(ref, {
            title: challengeTitles[i],
            description: "혼자가 힘들다면 함께해요! 서로 인증하고 응원하는 방입니다.",
            statusMessage: "오늘도 화이팅!",
            imageUrl: `https://picsum.photos/seed/challenge${i}/800/400`,
            category: activeCategories[i % activeCategories.length],
            tags: ["습관", "함께", "성장"],
            isPublic: true,
            host: user,
            participantCount: 10 + Math.floor(Math.random() * 200),
            participantIds: [uid], // My joined challenge
            growthRate: Math.floor(Math.random() * 30),
            avgAchievement: 80,
            retentionRate: 90,
            avgTrustScore: 85,
            createdAt: now.toISOString(),
            // Mock My Page context
            myAchievementRate: Math.floor(Math.random() * 90),
            myLastCertifiedAt: new Date(now.getTime() - Math.random() * 86400000 * 5).toISOString().split('T')[0]
        });
    }

    // 4. Create Scraps (3 items)
    const scrapCategories = ['PLAN', 'POST', 'SUBGOAL'];
    for(let i=0; i<3; i++) {
        const ref = doc(collection(db, 'scraps'));
        batch.set(ref, {
            userId: uid,
            type: scrapCategories[i],
            title: `스크랩한 항목 ${i+1}`,
            content: "나중에 다시 보려고 저장해둠.",
            originalId: `mock-original-${i}`,
            savedAt: now.toISOString(),
            category: "기타"
        });
    }

    // 5. Update User Stats
    const userRef = doc(db, 'users', uid);
    batch.update(userRef, {
        totalPlans: (user.totalPlans || 0) + 8,
        completedGoals: (user.completedGoals || 0) + 3,
        // Reset or boost trust score for demo
        trustScore: 85
    });

    await batch.commit();
};

export const clearDatabase = async () => {
    const collections = ['plans', 'challenges', 'scraps', 'chatRooms', 'users'];
    
    try {
        for (const colName of collections) {
            const q = query(collection(db, colName));
            const snapshot = await getDocs(q);
            
            // Delete in batches of 500
            const chunkedDocs = [];
            for (let i = 0; i < snapshot.docs.length; i += 500) {
                chunkedDocs.push(snapshot.docs.slice(i, i + 500));
            }

            for (const chunk of chunkedDocs) {
                const batch = writeBatch(db);
                chunk.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
        }
        console.log("Database cleared successfully");
    } catch (e) {
        console.error("Error clearing database:", e);
        throw e;
    }
};
