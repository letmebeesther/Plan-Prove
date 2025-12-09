
import { 
  collection, addDoc, query, where, getDocs, doc, updateDoc, 
  increment, serverTimestamp, writeBatch, getDoc, arrayUnion, deleteDoc 
} from "firebase/firestore";
import { db } from "./firebase";
import { Plan, Challenge, User, Evidence } from "../types";

// --- Database Maintenance ---

// Clear all data from main collections
export const clearDatabase = async () => {
  const collectionsToClear = ['plans', 'challenges', 'hall_of_fame', 'monthly_challenges', 'feeds', 'notices'];
  
  try {
    for (const colName of collectionsToClear) {
      const q = query(collection(db, colName));
      const snapshot = await getDocs(q);
      
      // Delete documents in batches (batch limit is 500)
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

  // 1. Seed Challenges (15 items)
  const challengesRef = collection(db, 'challenges');
  const challengeData = [
    // 생활루틴
    { title: '미라클 모닝 5AM', category: '생활루틴', tags: ['기상', '새벽'], count: 1240, growth: 15, msg: '일찍 일어나는 새가 벌레를 잡는다' },
    { title: '이불 개기 챌린지', category: '생활루틴', tags: ['정리', '아침'], count: 530, growth: 5, msg: '작은 성취로 시작하는 하루' },
    { title: '하루 물 2L 마시기', category: '생활루틴', tags: ['수분', '건강'], count: 3000, growth: 18, msg: '물은 생명이다' },
    // 독서
    { title: '매일 독서 30분', category: '독서', tags: ['책', '마음의양식'], count: 850, growth: 8, msg: '책 속에 길이 있다' },
    { title: '한 달에 1권 완독', category: '독서', tags: ['완독', '성취'], count: 1200, growth: 12, msg: '천천히 그러나 꾸준히' },
    { title: '필사 챌린지', category: '독서', tags: ['필사', '글쓰기'], count: 400, growth: 7, msg: '손으로 읽는 책' },
    // 운동
    { title: '매일 1만보 걷기', category: '운동', tags: ['걷기', '유산소'], count: 5000, growth: 10, msg: '걷는 것이 곧 사는 것이다' },
    { title: '플랭크 30일 챌린지', category: '운동', tags: ['코어', '홈트'], count: 2100, growth: 22, msg: '강철 코어 만들기' },
    { title: '매일 스쿼트 100개', category: '운동', tags: ['하체', '근력'], count: 1800, growth: 15, msg: '애플힙을 위하여' },
    // 건강관리
    { title: '설탕 끊기 챌린지', category: '건강관리', tags: ['다이어트', '건강'], count: 2300, growth: 25, msg: '건강한 몸에 건강한 정신' },
    { title: '간헐적 단식 16:8', category: '건강관리', tags: ['단식', '체중감량'], count: 3500, growth: 30, msg: '비움의 미학' },
    // 어학
    { title: '하루 한 줄 영어 일기', category: '어학', tags: ['영어', '일기'], count: 1500, growth: 12, msg: 'Practice makes perfect' },
    { title: 'TED 쉐도잉', category: '어학', tags: ['스피킹', '리스닝'], count: 900, growth: 9, msg: '원어민처럼 말하기' },
    // 커리어
    { title: '매일 코딩 문제 풀기', category: '커리어스킬', tags: ['코딩', '알고리즘'], count: 900, growth: 20, msg: '코딩은 밥먹듯이' },
    // 재정
    { title: '무지출 챌린지', category: '재정관리', tags: ['절약', '저축'], count: 4200, growth: 40, msg: '티끌 모아 태산' }
  ];

  challengeData.forEach((c, idx) => {
    const newRef = doc(challengesRef);
    batch.set(newRef, {
      title: c.title,
      description: `${c.title}에 도전하고 서로 인증하며 성장하는 모임입니다.`,
      statusMessage: c.msg,
      imageUrl: `https://picsum.photos/800/400?random=${100 + idx}`,
      category: c.category,
      tags: c.tags,
      isPublic: true,
      participantCount: c.count,
      growthRate: c.growth,
      avgAchievement: Math.floor(Math.random() * 20) + 70, // 70~90
      retentionRate: Math.floor(Math.random() * 20) + 70,
      avgTrustScore: Math.floor(Math.random() * 20) + 70,
      stabilityIndex: Math.floor(Math.random() * 10) + 90,
      createdAt: new Date().toISOString(),
      hostId: 'system',
    });
  });

  // 2. Seed Hall of Fame (10 items)
  const hallOfFameRef = collection(db, 'hall_of_fame');
  const hofData = [
    { type: 'BEST', rank: 1, title: '30일 파이썬 마스터', author: '코딩왕', score: 98, cat: '커리어' },
    { type: 'BEST', rank: 2, title: '매일 5km 러닝', author: '런닝맨', score: 96, cat: '운동' },
    { type: 'BEST', rank: 3, title: '토익 900점 달성', author: '영어공부', score: 94, cat: '어학' },
    { type: 'BEST', rank: 4, title: '매일 드로잉 1장', author: '아트박스', score: 93, cat: '취미' },
    { type: 'BEST', rank: 5, title: '경제 뉴스 스크랩', author: '워렌버핏', score: 92, cat: '재정관리' },
    { type: 'CHALLENGE', rank: 1, title: '미라클 모닝', author: '새벽반', score: 99, cat: '생활' },
    { type: 'CHALLENGE', rank: 2, title: '1만보 걷기', author: '걷기왕', score: 97, cat: '운동' },
    { type: 'TRUST', rank: 1, title: '성실함의 아이콘', author: '바른생활', score: 100, cat: '전체' },
    { type: 'TRUST', rank: 2, title: '약속은 지킨다', author: '칼약속', score: 99, cat: '전체' },
    { type: 'ACHIEVEMENT', rank: 1, title: '100일 챌린지 완주', author: '끈기남', score: 100, cat: '전체' }
  ];

  hofData.forEach((h, idx) => {
    const newRef = doc(hallOfFameRef);
    batch.set(newRef, {
      type: h.type,
      rank: h.rank,
      title: h.title,
      authorName: h.author,
      score: h.score,
      category: h.cat,
      avatarUrl: `https://picsum.photos/200/200?random=${200 + idx}`,
    });
  });

  // 3. Seed Monthly Challenges (3 items)
  const monthlyRef = collection(db, 'monthly_challenges');
  const mockMonthly = [
      {
        title: '10월의 독서왕: 가을은 독서의 계절',
        imageUrl: 'https://picsum.photos/400/250?random=301',
        description: '선선한 가을 바람과 함께 책 한 권의 여유를 즐겨보세요.',
        participants: 3421,
        startDate: '2023-10-01',
        endDate: '2023-10-31',
        status: 'ACTIVE',
        tags: ['독서', '가을', '이벤트']
      },
      {
        title: '할로윈 코스튬 런닝',
        imageUrl: 'https://picsum.photos/400/250?random=302',
        description: '재미있는 복장을 입고 달리며 건강도 챙기고 추억도 남기세요!',
        participants: 1205,
        startDate: '2023-10-25',
        endDate: '2023-10-31',
        status: 'ACTIVE',
        tags: ['운동', '할로윈', '러닝']
      },
      {
        title: '9월 추석맞이 칼로리 버닝 (종료)',
        imageUrl: 'https://picsum.photos/400/250?random=303',
        description: '명절 음식 태우기 프로젝트',
        participants: 8900,
        startDate: '2023-09-01',
        endDate: '2023-09-30',
        status: 'ENDED',
        tags: ['다이어트', '명절']
      }
  ];
  mockMonthly.forEach(m => {
      const newRef = doc(monthlyRef);
      batch.set(newRef, m);
  });

  // 4. Seed User Plans (5 items for MyPage)
  const plansRef = collection(db, 'plans');
  const userPlans = [
    {
        title: '나의 첫 번째 계획: 물 마시기',
        desc: '하루 2L 물 마시기 도전',
        cat: '건강관리',
        prog: 33,
        days: 30,
        success: null,
        sub: [{ title: '텀블러 사기', status: 'completed' }, { title: '오전 1L', status: 'pending' }, { title: '오후 1L', status: 'pending' }]
    },
    {
        title: '스페인어 기초 떼기',
        desc: '여행 가서 주문할 수 있을 정도로 공부하기',
        cat: '어학',
        prog: 60,
        days: 60,
        success: null,
        sub: [{ title: '알파벳 암기', status: 'completed' }, { title: '인사말 배우기', status: 'completed' }, { title: '숫자 익히기', status: 'pending' }]
    },
    {
        title: '30일 독서 습관',
        desc: '매일 30분 책 읽기',
        cat: '독서',
        prog: 100,
        days: -30, // Past
        success: true,
        final: 100,
        sub: [{ title: '책 선정', status: 'completed' }, { title: '1주차 완독', status: 'completed' }]
    },
    {
        title: '주 3회 수영하기',
        desc: '체력 증진',
        cat: '운동',
        prog: 45,
        days: -60, // Past
        success: false,
        final: 45,
        reason: '야근으로 인한 시간 부족',
        sub: [{ title: '수영복 구매', status: 'completed' }, { title: '1주차 출석', status: 'failed' }]
    },
    {
        title: '자격증 취득',
        desc: '정보처리기사 실기',
        cat: '자격증',
        prog: 10,
        days: 14,
        success: null,
        sub: [{ title: '책 구매', status: 'completed' }, { title: '1과목 공부', status: 'pending' }]
    }
  ];

  userPlans.forEach((p, i) => {
      const newRef = doc(plansRef);
      const startDate = new Date();
      if (p.days < 0) startDate.setDate(startDate.getDate() + p.days); // Past start
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      batch.set(newRef, {
        title: p.title,
        description: p.desc,
        category: p.cat,
        progress: p.prog,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        subGoals: p.sub.map(s => ({ 
            title: s.title, 
            description: '', 
            status: s.status, 
            dueDate: endDate.toISOString().split('T')[0],
            evidences: [] 
        })),
        authorId: userId,
        createdAt: startDate.toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: true,
        tags: [p.cat, '도전'],
        growthRate: Math.floor(Math.random() * 20),
        lastCertifiedAt: new Date().toISOString().split('T')[0],
        daysLeft: p.days > 0 ? p.days : 0,
        isSuccess: p.success,
        finalAchievementRate: p.final,
        failureReason: p.reason
      });
  });

  await batch.commit();
};

// --- Plans ---
export const createPlan = async (userId: string, planData: any) => {
  try {
    const docRef = await addDoc(collection(db, "plans"), {
      ...planData,
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      isPublic: true
    });
    
    // Update User stats
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
  const q = query(collection(db, "plans"), where("authorId", "==", userId));
  const querySnapshot = await getDocs(q);
  // Need to populate author data, but for now we rely on client context or stored simple author data
  // For better structure, we should fetch user data. Here we mock it or assume simple data is enough.
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
};

export const fetchPlanById = async (planId: string): Promise<Plan | null> => {
  try {
    const docRef = doc(db, "plans", planId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Fetch Author Details if needed, or assume authorId is present and we can fetch or it's embedded
      // Here we assume author data might be minimal or we need to fetch it.
      // For this demo, let's construct a User object from authorId if `author` object isn't fully stored.
      // Ideally, `author` object should be stored in Plan to avoid extra reads, or use `authorId`.
      
      let author = data.author || { id: data.authorId, nickname: 'Unknown', avatarUrl: '' };
      
      if (data.authorId && !data.author) {
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

// Mock function to update SubGoal Evidence (In real app, this updates nested array or subcollection)
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
            
            // Auto-update status if it was pending
            if (updatedSubGoals[subGoalIndex].status === 'pending') {
                updatedSubGoals[subGoalIndex].status = 'completed'; // Simple logic
            }

            // Recalculate progress
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

// --- Challenges ---
export const fetchChallenges = async () => {
  const querySnapshot = await getDocs(collection(db, "challenges"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
};

// --- Hall of Fame ---
export const fetchHallOfFame = async (type: string = 'BEST') => {
  const q = query(collection(db, 'hall_of_fame'), where('type', '==', type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
