
import { 
  collection, addDoc, query, where, getDocs, doc, updateDoc, 
  increment, serverTimestamp, writeBatch, getDoc, arrayUnion, deleteDoc,
  orderBy, limit 
} from "firebase/firestore";
import { db } from "./firebase";
import { Plan, Challenge, User, Evidence, ScrapItem, Certification, SubGoal } from "../types";

// --- Database Maintenance ---

export const clearDatabase = async () => {
  const collectionsToClear = ['plans', 'challenges', 'hall_of_fame', 'monthly_challenges', 'feeds', 'notices', 'users', 'chat_rooms', 'scraps'];
  
  try {
    for (const colName of collectionsToClear) {
      const q = query(collection(db, colName));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });
      
      if (count > 0) {
        await batch.commit();
        console.log(`Cleared ${count} documents from ${colName}`);
      }
    }
    return true;
  } catch (e) {
    console.error("Error clearing database:", e);
    throw e;
  }
};

// --- Seeding Data (Initial Setup) ---
export const seedDatabase = async (userId: string) => {
  const batch = writeBatch(db);
  console.log("Starting database seed...");

  // 0. Seed Dummy Users & Their Plans
  const usersRef = collection(db, 'users');
  const plansRef = collection(db, 'plans'); 
  
  const dummyUsers = [
    { id: 'user_runner', nickname: '러닝마스터', trustScore: 92, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner', status: '오늘도 달린다' },
    { id: 'user_book', nickname: '책벌레', trustScore: 88, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=book', status: '독서 삼매경' },
    { id: 'user_health', nickname: '헬스보이', trustScore: 75, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=health', status: '득근득근' },
    { id: 'user_coding', nickname: '코딩요정', trustScore: 95, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coding', status: '버그 박멸' },
    { id: 'user_money', nickname: '저축왕', trustScore: 99, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=money', status: '티끌 모아 태산' }
  ];

  const dummyUserPlanMap: Record<string, string> = {}; // Map UserId -> PlanId

  dummyUsers.forEach(u => {
      // Create User
      const uRef = doc(db, 'users', u.id);
      batch.set(uRef, {
          nickname: u.nickname,
          email: `${u.id}@example.com`,
          avatarUrl: u.avatarUrl,
          trustScore: u.trustScore,
          statusMessage: u.status,
          followers: Math.floor(Math.random() * 50),
          following: Math.floor(Math.random() * 50),
          totalPlans: 1,
          completedGoals: 0,
          hasWearable: Math.random() > 0.5 // Randomly assign wearable
      });

      // Create a Plan for this dummy user
      const planRef = doc(plansRef);
      dummyUserPlanMap[u.id] = planRef.id;
      
      batch.set(planRef, {
          title: `${u.nickname}의 대표 도전`,
          description: `안녕하세요, ${u.nickname}입니다. 열심히 도전하고 인증하겠습니다!`,
          category: '생활루틴',
          progress: 50,
          startDate: '2023-10-01',
          endDate: '2023-10-31',
          authorId: u.id,
          author: { id: u.id, nickname: u.nickname, avatarUrl: u.avatarUrl, trustScore: u.trustScore },
          subGoals: [
              { id: 'sg1', title: '1주차 미션', status: 'completed', description: '가볍게 시작하기', dueDate: '2023-10-07', evidences: [] },
              { id: 'sg2', title: '2주차 미션', status: 'completed', description: '적응하기', dueDate: '2023-10-14', evidences: [] },
              { id: 'sg3', title: '3주차 미션', status: 'pending', description: '습관화하기', dueDate: '2023-10-21', evidences: [] }
          ],
          isPublic: true,
          likes: Math.floor(Math.random() * 50),
          imageUrl: `https://picsum.photos/800/400?random=${u.id}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          daysLeft: 10
      });
  });

  // 1. Seed Challenges
  const challengesRef = collection(db, 'challenges');
  const challengeIds: string[] = [];

  const challengeData = [
    { title: '미라클 모닝 5AM', category: '생활루틴', tags: ['기상', '새벽'], count: 1240, growth: 15, msg: '일찍 일어나는 새가 벌레를 잡는다' },
    { title: '이불 개기 챌린지', category: '생활루틴', tags: ['정리', '아침'], count: 530, growth: 5, msg: '작은 성취로 시작하는 하루' },
    { title: '하루 물 2L 마시기', category: '생활루틴', tags: ['수분', '건강'], count: 3000, growth: 18, msg: '물은 생명이다' },
    { title: '매일 독서 30분', category: '독서', tags: ['책', '마음의양식'], count: 850, growth: 8, msg: '책 속에 길이 있다' },
    { title: '한 달에 1권 완독', category: '독서', tags: ['완독', '성취'], count: 1200, growth: 12, msg: '천천히 그러나 꾸준히' },
    { title: '매일 1만보 걷기', category: '운동', tags: ['걷기', '유산소'], count: 5000, growth: 10, msg: '걷는 것이 곧 사는 것이다' },
    { title: '플랭크 30일 챌린지', category: '운동', tags: ['코어', '홈트'], count: 2100, growth: 22, msg: '강철 코어 만들기' },
    { title: '설탕 끊기 챌린지', category: '건강관리', tags: ['다이어트', '건강'], count: 2300, growth: 25, msg: '건강한 몸에 건강한 정신' },
    { title: '하루 한 줄 영어 일기', category: '어학', tags: ['영어', '일기'], count: 1500, growth: 12, msg: 'Practice makes perfect' },
    { title: '매일 코딩 문제 풀기', category: '커리어스킬', tags: ['코딩', '알고리즘'], count: 900, growth: 20, msg: '코딩은 밥먹듯이' },
    { title: '무지출 챌린지', category: '재정관리', tags: ['절약', '저축'], count: 4200, growth: 40, msg: '티끌 모아 태산' }
  ];

  challengeData.forEach((c, idx) => {
    const newRef = doc(challengesRef);
    challengeIds.push(newRef.id);
    const participants = idx < 2 ? ['user_runner', userId] : ['user_runner'];

    batch.set(newRef, {
      title: c.title,
      description: `${c.title}에 도전하고 서로 인증하며 성장하는 모임입니다.`,
      statusMessage: c.msg,
      imageUrl: `https://picsum.photos/800/400?random=${100 + idx}`,
      category: c.category,
      tags: c.tags,
      isPublic: true,
      participantCount: c.count,
      participantIds: participants,
      growthRate: c.growth,
      avgAchievement: Math.floor(Math.random() * 20) + 70,
      retentionRate: Math.floor(Math.random() * 20) + 70,
      avgTrustScore: Math.floor(Math.random() * 20) + 70,
      stabilityIndex: Math.floor(Math.random() * 10) + 90,
      createdAt: new Date().toISOString(),
      host: { id: 'user_runner', nickname: '러닝마스터', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=runner', trustScore: 92 },
      coHosts: [],
      notices: []
    });
  });

  // 2. Seed Hall of Fame (Refined with Real Plans)
  const hallOfFameRef = collection(db, 'hall_of_fame');
  
  const hofData = [
    { type: 'BEST', rank: 1, title: '30일 파이썬 마스터', author: '코딩왕', score: 98, cat: '커리어', img: 'https://picsum.photos/400/200?random=201', desc: '매일 1시간씩 파이썬 공부하기 프로젝트입니다.' },
    { type: 'BEST', rank: 2, title: '매일 5km 러닝', author: '런닝맨', score: 96, cat: '운동', img: 'https://picsum.photos/400/200?random=202', desc: '비가 오나 눈이 오나 달립니다.' },
    { type: 'BEST', rank: 3, title: '토익 900점 달성', author: '영어공부', score: 94, cat: '어학', img: 'https://picsum.photos/400/200?random=203', desc: '취업을 위한 토익 점수 달성하기.' },
    { type: 'BEST', rank: 4, title: '매일 드로잉 1장', author: '아트박스', score: 93, cat: '취미', img: 'https://picsum.photos/400/200?random=204', desc: '그림 실력 향상을 위한 데일리 크로키' },
    { type: 'BEST', rank: 5, title: '경제 뉴스 스크랩', author: '워렌버핏', score: 92, cat: '재정관리', img: 'https://picsum.photos/400/200?random=205', desc: '매일 아침 경제 신문 읽고 요약하기' }
  ];

  for (const h of hofData) {
    const planRef = doc(plansRef);
    const authorId = `hof_user_${h.rank}`;
    const authorRef = doc(db, 'users', authorId);
    
    // Create HOF Author
    batch.set(authorRef, {
        nickname: h.author,
        email: `${authorId}@example.com`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`,
        trustScore: 95,
        statusMessage: '명예의 전당 헌액자',
        totalPlans: 10,
        completedGoals: 10,
        hasWearable: false
    });

    // Create HOF Plan
    batch.set(planRef, {
        title: h.title,
        description: h.desc,
        category: h.cat,
        progress: 100,
        startDate: '2023-09-01',
        endDate: '2023-09-30',
        authorId: authorId,
        author: { id: authorId, nickname: h.author, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`, trustScore: 95 },
        subGoals: [
            { id: 'hsg1', title: '1주차 목표', status: 'completed', description: '기초 다지기', dueDate: '2023-09-07', evidences: [] },
            { id: 'hsg2', title: '2주차 목표', status: 'completed', description: '심화 과정', dueDate: '2023-09-14', evidences: [] },
            { id: 'hsg3', title: '3주차 목표', status: 'completed', description: '실전 응용', dueDate: '2023-09-21', evidences: [] },
            { id: 'hsg4', title: '최종 완성', status: 'completed', description: '결과물 제출', dueDate: '2023-09-30', evidences: [] }
        ],
        isPublic: true,
        likes: h.score,
        imageUrl: h.img,
        isSuccess: true,
        finalAchievementRate: 100,
        hasRetrospective: true,
        retrospectiveContent: "꾸준함이 답이었습니다. 모두 화이팅!",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    // Create HOF Entry linking to Plan
    const newRef = doc(hallOfFameRef);
    batch.set(newRef, {
      type: h.type,
      rank: h.rank,
      title: h.title,
      authorName: h.author,
      score: h.score,
      category: h.cat,
      imageUrl: h.img,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${200 + h.rank}`,
      planId: planRef.id
    });
  }

  // 3. Seed Feeds (Enriched with Plan Links & Expanded Data)
  const feedsRef = collection(db, 'feeds');
  const feedData = [
      { desc: '오늘 미션 완료! 상쾌합니다.', img: 'https://picsum.photos/400/400?random=901', uIndex: 0, title: '새벽 러닝 인증' },
      { desc: '힘든 하루였지만 해냈다. 모두 화이팅!', img: 'https://picsum.photos/400/400?random=902', uIndex: 1, title: '독서 30분 달성' },
      { desc: '꾸준함이 답이다. 벌써 10일차!', img: 'https://picsum.photos/400/400?random=903', uIndex: 2, title: '식단 조절 성공' },
      { desc: '어제보다 나은 오늘!', img: 'https://picsum.photos/400/400?random=904', uIndex: 3, title: '코딩 문제 풀이' },
      { desc: '인증 완료! 다들 주말 잘 보내세요.', img: 'https://picsum.photos/400/400?random=905', uIndex: 4, title: '가계부 작성' },
      { desc: '새로운 루틴 적응 중입니다.', img: 'https://picsum.photos/400/400?random=906', uIndex: 0, title: '아침 스트레칭' },
      { desc: '오늘도 목표 달성! 뿌듯하네요.', img: 'https://picsum.photos/400/400?random=907', uIndex: 1, title: '영어 단어 암기' },
      { desc: '비가 와도 운동은 멈추지 않는다.', img: 'https://picsum.photos/400/400?random=908', uIndex: 2, title: '홈트레이닝 인증' },
      { desc: '작은 성공이 모여 큰 변화를 만듭니다.', img: 'https://picsum.photos/400/400?random=909', uIndex: 3, title: '알고리즘 공부' },
      { desc: '주말에도 잊지 않고 인증합니다.', img: 'https://picsum.photos/400/400?random=910', uIndex: 4, title: '무지출 챌린지' },
      { desc: '친구들과 함께하니 더 재미있네요!', img: 'https://picsum.photos/400/400?random=911', uIndex: 0, title: '저녁 산책' },
      { desc: '마지막까지 포기하지 않겠습니다.', img: 'https://picsum.photos/400/400?random=912', uIndex: 1, title: '독서 노트 작성' }
  ];
  
  feedData.forEach((f, i) => {
      const newRef = doc(feedsRef);
      const u = dummyUsers[f.uIndex];
      const planId = dummyUserPlanMap[u.id]; // Link to actual plan

      batch.set(newRef, {
          id: newRef.id,
          user: { id: u.id, nickname: u.nickname, avatarUrl: u.avatarUrl, trustScore: u.trustScore },
          description: f.desc,
          imageUrl: f.img,
          challengeId: challengeIds.length > 0 ? challengeIds[i % challengeIds.length] : null,
          planId: planId, // Linked!
          relatedGoalTitle: f.title,
          createdAt: new Date(Date.now() - (i * 3600000)).toISOString(), // Distributed over hours
          likes: Math.floor(Math.random() * 30) + 10,
          comments: Math.floor(Math.random() * 5),
          reactions: {}
      });
  });

  // 4. Seed User Plans (Current User)
  const userPlans = [
    { title: '물 마시기 습관', desc: '하루 2L 물 마시기', cat: '건강관리', prog: 33, days: 30, sub: [{ title: '텀블러 구매', status: 'completed' }, { title: '오전 1L', status: 'pending' }, { title: '오후 1L', status: 'pending' }] },
    { title: '스페인어 기초', desc: '여행 회화 마스터', cat: '어학', prog: 60, days: 60, sub: [{ title: '알파벳', status: 'completed' }, { title: '인사말', status: 'completed' }, { title: '숫자', status: 'pending' }] },
    { title: '30일 독서', desc: '출퇴근길 독서', cat: '독서', prog: 100, days: -30, success: true, final: 100, sub: [{ title: '책 선정', status: 'completed' }, { title: '완독', status: 'completed' }] }
  ];

  userPlans.forEach((p, i) => {
      const newRef = doc(plansRef);
      const startDate = new Date();
      if (p.days < 0) startDate.setDate(startDate.getDate() + p.days);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      batch.set(newRef, {
        title: p.title,
        description: p.desc,
        category: p.cat,
        progress: p.prog,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        subGoals: p.sub.map((s, idx) => ({ 
            id: `sg-${idx}`,
            title: s.title, 
            description: '상세 설명', 
            status: s.status, 
            dueDate: endDate.toISOString().split('T')[0],
            evidences: [] 
        })),
        authorId: userId,
        author: { id: userId, nickname: '나', avatarUrl: '', trustScore: 50 }, 
        createdAt: startDate.toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        tags: [p.cat],
        growthRate: 10,
        lastCertifiedAt: new Date().toISOString().split('T')[0],
        daysLeft: p.days > 0 ? p.days : 0,
        isSuccess: p.success || null,
        finalAchievementRate: p.final || null
      });
  });

  await batch.commit();
  console.log("Database seed completed with Linked Plans!");
};

// ... (Rest of existing functions) ...

export const createPlan = async (userId: string, planData: any) => {
  try {
    const docRef = await addDoc(collection(db, "plans"), {
      ...planData,
      authorId: userId,
      author: { id: userId, nickname: 'User', avatarUrl: '', trustScore: 50 }, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      isPublic: true
    });
    
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      totalPlans: increment(1)
    });
    
    return docRef.id;
  } catch (e) {
    console.error("Error creating plan: ", e);
    throw e;
  }
};

export const fetchMyActivePlans = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(collection(db, "plans"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const allPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
  return allPlans.filter(plan => plan.endDate >= today);
};

export const fetchMyPastPlans = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const q = query(collection(db, "plans"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  const allPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
  return allPlans.filter(plan => plan.endDate < today);
};

export const fetchPlanById = async (planId: string): Promise<Plan | null> => {
  try {
    const docRef = doc(db, "plans", planId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let author = data.author || { id: data.authorId, nickname: 'Unknown', avatarUrl: '' };
      
      if (data.authorId && (!data.author || !data.author.nickname)) {
          const userDoc = await getDoc(doc(db, "users", data.authorId));
          if (userDoc.exists()) {
              author = { id: userDoc.id, ...userDoc.data() };
          }
      }

      return { id: docSnap.id, ...data, author } as Plan;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error fetching plan:", e);
    return null;
  }
};

export const submitEvidence = async (planId: string, subGoalIndex: number, evidence: Evidence) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const updatedSubGoals = [...planData.subGoals];
            
            if (!updatedSubGoals[subGoalIndex].evidences) {
                updatedSubGoals[subGoalIndex].evidences = [];
            }
            
            updatedSubGoals[subGoalIndex].evidences!.push(evidence);
            
            if (updatedSubGoals[subGoalIndex].status === 'pending') {
                updatedSubGoals[subGoalIndex].status = 'completed'; 
            }

            const completedCount = updatedSubGoals.filter(sg => sg.status === 'completed').length;
            const newProgress = Math.round((completedCount / updatedSubGoals.length) * 100);

            await updateDoc(planRef, {
                subGoals: updatedSubGoals,
                progress: newProgress,
                lastCertifiedAt: new Date().toISOString().split('T')[0]
            });
            
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error submitting evidence:", e);
        throw e;
    }
}

export const deletePlan = async (planId: string) => {
  try {
    await deleteDoc(doc(db, "plans", planId));
    return true;
  } catch (e) {
    console.error("Error deleting plan:", e);
    throw e;
  }
};

export const updateSubGoalStatus = async (planId: string, subGoalIndex: number, status: 'pending' | 'completed' | 'failed', failureReason?: string) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const updatedSubGoals = [...planData.subGoals];
            
            updatedSubGoals[subGoalIndex].status = status;
            if (failureReason) {
                updatedSubGoals[subGoalIndex].failureReason = failureReason;
            }
            
            const completedCount = updatedSubGoals.filter(sg => sg.status === 'completed').length;
            const newProgress = Math.round((completedCount / updatedSubGoals.length) * 100);

            await updateDoc(planRef, {
                subGoals: updatedSubGoals,
                progress: newProgress
            });
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error updating subgoal status:", e);
        throw e;
    }
};

export const updateRetrospective = async (planId: string, content: string) => {
    try {
        const planRef = doc(db, "plans", planId);
        await updateDoc(planRef, {
            hasRetrospective: true,
            retrospectiveContent: content
        });
        return true;
    } catch (e) {
        console.error("Error updating retrospective:", e);
        throw e;
    }
};

export const fetchChallenges = async () => {
  const querySnapshot = await getDocs(collection(db, "challenges"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
};

export const fetchMyJoinedChallenges = async (userId: string) => {
    const q = query(collection(db, "challenges"), where("participantIds", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            myAchievementRate: Math.floor(Math.random() * 40) + 50,
            myLastCertifiedAt: '2일 전'
        } as Challenge;
    });
};

export const fetchMyScraps = async (userId: string) => {
    const q = query(collection(db, "scraps"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScrapItem));
}

export const fetchHallOfFame = async (type: string = 'BEST') => {
  const q = query(collection(db, 'hall_of_fame'), where('type', '==', type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchPopularFeeds = async () => {
  try {
    const feedsRef = collection(db, "feeds");
    const q = query(feedsRef, orderBy("likes", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Certification));
  } catch (e) {
    console.error("Error fetching popular feeds:", e);
    return [];
  }
};

export const fetchFriendActivities = async () => {
  try {
    const feedsRef = collection(db, "feeds");
    const q = query(feedsRef, orderBy("createdAt", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Certification));
  } catch (e) {
    console.error("Error fetching friend activities:", e);
    return [];
  }
};

export const updateUserWearableStatus = async (userId: string, status: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { hasWearable: status });
    return true;
  } catch (e) {
    console.error("Error updating wearable status:", e);
    throw e;
  }
};

// --- Sub-Goal CRUD (New) ---

export const addSubGoal = async (planId: string, subGoal: SubGoal) => {
    try {
        const planRef = doc(db, "plans", planId);
        await updateDoc(planRef, {
            subGoals: arrayUnion(subGoal)
        });
        return true;
    } catch (e) {
        console.error("Error adding subgoal:", e);
        throw e;
    }
};

export const deleteSubGoal = async (planId: string, subGoalIndex: number) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const newSubGoals = planData.subGoals.filter((_, i) => i !== subGoalIndex);
            
            const completedCount = newSubGoals.filter(sg => sg.status === 'completed').length;
            const newProgress = newSubGoals.length > 0 ? Math.round((completedCount / newSubGoals.length) * 100) : 0;

            await updateDoc(planRef, {
                subGoals: newSubGoals,
                progress: newProgress
            });
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error deleting subgoal:", e);
        throw e;
    }
};

export const updateSubGoalDetails = async (planId: string, subGoalIndex: number, updatedData: Partial<SubGoal>) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const newSubGoals = [...planData.subGoals];
            newSubGoals[subGoalIndex] = { ...newSubGoals[subGoalIndex], ...updatedData };
            
            await updateDoc(planRef, { subGoals: newSubGoals });
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error updating subgoal details:", e);
        throw e;
    }
};

export const deleteEvidence = async (planId: string, subGoalIndex: number, evidenceId: string) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const newSubGoals = [...planData.subGoals];
            const subGoal = newSubGoals[subGoalIndex];
            
            if (subGoal.evidences) {
                subGoal.evidences = subGoal.evidences.filter(e => e.id !== evidenceId);
                await updateDoc(planRef, { subGoals: newSubGoals });
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error("Error deleting evidence:", e);
        throw e;
    }
};

export const updateEvidence = async (planId: string, subGoalIndex: number, evidenceId: string, updatedData: Partial<Evidence>) => {
    try {
        const planRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planRef);
        
        if (planSnap.exists()) {
            const planData = planSnap.data() as Plan;
            const newSubGoals = [...planData.subGoals];
            const subGoal = newSubGoals[subGoalIndex];
            
            if (subGoal.evidences) {
                const evidenceIndex = subGoal.evidences.findIndex(e => e.id === evidenceId);
                if (evidenceIndex !== -1) {
                    subGoal.evidences[evidenceIndex] = { ...subGoal.evidences[evidenceIndex], ...updatedData };
                    await updateDoc(planRef, { subGoals: newSubGoals });
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        console.error("Error updating evidence:", e);
        throw e;
    }
};

// --- Admin / Developer Functions (New) ---

export const adminUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
        return true;
    } catch (e) {
        console.error("Error updating user (Admin):", e);
        throw e;
    }
};
