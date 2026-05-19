// ─── TYPES ────────────────────────────────────────────────────────────────────

export type DietaryTag = 'vegan' | 'gluten-free' | 'nuts' | 'dairy-free';

export interface MenuItem {
  id: string;
  nameKey: string;
  arabicNameKey: string;
  descriptionKey: string;
  price: number;
  dietaryTags: DietaryTag[];
  categoryKey: string;
  isChefsChoice?: boolean;
  isHighMargin?: boolean;
  image: string;
  images?: string[];
  availability: { isAvailable: boolean; startTime?: string; endTime?: string };
  nutrition?: { calories: number; protein: number; carbs: number };
}

export interface MenuSection {
  categoryKey: string;
  arabicLabelKey: string;
  items: MenuItem[];
}

// ─── IMAGES ───────────────────────────────────────────────────────────────────

const IMG = {
  hummus:    'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800&auto=format&fit=crop',
  salad:     'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
  mezze:     'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
  grill:     'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800&auto=format&fit=crop',
  lamb:      'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800&auto=format&fit=crop',
  chicken:   'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
  kibbeh:    'https://images.unsplash.com/photo-1559561853-08451507cbe7?q=80&w=800&auto=format&fit=crop',
  halloumi:  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=800&auto=format&fit=crop',
  wrap:      'https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=800&auto=format&fit=crop',
  shawarma:  'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=800&auto=format&fit=crop',
  dessert:   'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=400&auto=format',
  burger:    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
  eggs:      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop',
  juice:     'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=800&auto=format&fit=crop',
  coffee:    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop',
  soup:      'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
  fries:     'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop',
  drink:     'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop',
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const MENU_DATA: MenuSection[] = [

  // ── FRÜHSTÜCK / BREAKFAST ──────────────────────────────────────────────────
  {
    categoryKey: 'sectionBreakfast',
    arabicLabelKey: 'sectionBreakfastArabic',
    items: [
      { id: 'bf1', nameKey: 'bf1Name', arabicNameKey: 'bf1Ar', descriptionKey: 'bf1Desc', price: 9,  dietaryTags: ['vegan'],               categoryKey: 'sectionBreakfast', image: IMG.hummus,   availability: { isAvailable: true } },
      { id: 'bf2', nameKey: 'bf2Name', arabicNameKey: 'bf2Ar', descriptionKey: 'bf2Desc', price: 12, dietaryTags: ['nuts'],                 categoryKey: 'sectionBreakfast', image: IMG.hummus,   availability: { isAvailable: true } },
      { id: 'bf3', nameKey: 'bf3Name', arabicNameKey: 'bf3Ar', descriptionKey: 'bf3Desc', price: 11, dietaryTags: ['vegan'],               categoryKey: 'sectionBreakfast', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'bf4', nameKey: 'bf4Name', arabicNameKey: 'bf4Ar', descriptionKey: 'bf4Desc', price: 11, dietaryTags: [],                       categoryKey: 'sectionBreakfast', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'bf5', nameKey: 'bf5Name', arabicNameKey: 'bf5Ar', descriptionKey: 'bf5Desc', price: 6,  dietaryTags: [],                       categoryKey: 'sectionBreakfast', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'bf6', nameKey: 'bf6Name', arabicNameKey: 'bf6Ar', descriptionKey: 'bf6Desc', price: 9,  dietaryTags: [],                       categoryKey: 'sectionBreakfast', image: IMG.eggs,     availability: { isAvailable: true } },
      { id: 'bf7', nameKey: 'bf7Name', arabicNameKey: 'bf7Ar', descriptionKey: 'bf7Desc', price: 12, dietaryTags: [],                       categoryKey: 'sectionBreakfast', image: IMG.eggs,     availability: { isAvailable: true } },
      { id: 'bf8', nameKey: 'bf8Name', arabicNameKey: 'bf8Ar', descriptionKey: 'bf8Desc', price: 10, dietaryTags: [],                       categoryKey: 'sectionBreakfast', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'bf9', nameKey: 'bf9Name', arabicNameKey: 'bf9Ar', descriptionKey: 'bf9Desc', price: 10, dietaryTags: ['vegan'],               categoryKey: 'sectionBreakfast', image: IMG.mezze,    availability: { isAvailable: true } },
    ],
  },

  // ── SANDWICHES ─────────────────────────────────────────────────────────────
  {
    categoryKey: 'sectionSandwiches',
    arabicLabelKey: 'sectionSandwichesArabic',
    items: [
      { id: 'sw1',  nameKey: 'sw1Name',  arabicNameKey: 'sw1Ar',  descriptionKey: 'sw1Desc',  price: 6,  dietaryTags: ['vegan'],               categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw2',  nameKey: 'sw2Name',  arabicNameKey: 'sw2Ar',  descriptionKey: 'sw2Desc',  price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw3',  nameKey: 'sw3Name',  arabicNameKey: 'sw3Ar',  descriptionKey: 'sw3Desc',  price: 7,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw4',  nameKey: 'sw4Name',  arabicNameKey: 'sw4Ar',  descriptionKey: 'sw4Desc',  price: 8,  dietaryTags: ['vegan'],               categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw5',  nameKey: 'sw5Name',  arabicNameKey: 'sw5Ar',  descriptionKey: 'sw5Desc',  price: 9,  dietaryTags: ['vegan'],               categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw6',  nameKey: 'sw6Name',  arabicNameKey: 'sw6Ar',  descriptionKey: 'sw6Desc',  price: 9,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw7',  nameKey: 'sw7Name',  arabicNameKey: 'sw7Ar',  descriptionKey: 'sw7Desc',  price: 10, dietaryTags: [],                       categoryKey: 'sectionSandwiches', isChefsChoice: true, image: IMG.wrap, availability: { isAvailable: true } },
      { id: 'sw8',  nameKey: 'sw8Name',  arabicNameKey: 'sw8Ar',  descriptionKey: 'sw8Desc',  price: 12, dietaryTags: [],                       categoryKey: 'sectionSandwiches', isChefsChoice: true, image: IMG.wrap, availability: { isAvailable: true } },
      { id: 'sw9',  nameKey: 'sw9Name',  arabicNameKey: 'sw9Ar',  descriptionKey: 'sw9Desc',  price: 7,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'sw10', nameKey: 'sw10Name', arabicNameKey: 'sw10Ar', descriptionKey: 'sw10Desc', price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'sw11', nameKey: 'sw11Name', arabicNameKey: 'sw11Ar', descriptionKey: 'sw11Desc', price: 9,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'sw12', nameKey: 'sw12Name', arabicNameKey: 'sw12Ar', descriptionKey: 'sw12Desc', price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'sw13', nameKey: 'sw13Name', arabicNameKey: 'sw13Ar', descriptionKey: 'sw13Desc', price: 9,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'sw14', nameKey: 'sw14Name', arabicNameKey: 'sw14Ar', descriptionKey: 'sw14Desc', price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.chicken,  availability: { isAvailable: true } },
      { id: 'sw15', nameKey: 'sw15Name', arabicNameKey: 'sw15Ar', descriptionKey: 'sw15Desc', price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.grill,    availability: { isAvailable: true } },
      { id: 'sw16', nameKey: 'sw16Name', arabicNameKey: 'sw16Ar', descriptionKey: 'sw16Desc', price: 7,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw17', nameKey: 'sw17Name', arabicNameKey: 'sw17Ar', descriptionKey: 'sw17Desc', price: 8,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'sw18', nameKey: 'sw18Name', arabicNameKey: 'sw18Ar', descriptionKey: 'sw18Desc', price: 9,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.chicken,  availability: { isAvailable: true } },
      { id: 'sw19', nameKey: 'sw19Name', arabicNameKey: 'sw19Ar', descriptionKey: 'sw19Desc', price: 9,  dietaryTags: [],                       categoryKey: 'sectionSandwiches', image: IMG.wrap,     availability: { isAvailable: true } },
    ],
  },

  // ── BURGER ─────────────────────────────────────────────────────────────────
  {
    categoryKey: 'sectionBurger',
    arabicLabelKey: 'sectionBurgerArabic',
    items: [
      { id: 'bg1', nameKey: 'bg1Name', arabicNameKey: 'bg1Ar', descriptionKey: 'bg1Desc', price: 13, dietaryTags: [],        categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
      { id: 'bg2', nameKey: 'bg2Name', arabicNameKey: 'bg2Ar', descriptionKey: 'bg2Desc', price: 14, dietaryTags: [],        categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
      { id: 'bg3', nameKey: 'bg3Name', arabicNameKey: 'bg3Ar', descriptionKey: 'bg3Desc', price: 13, dietaryTags: [],        categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
      { id: 'bg4', nameKey: 'bg4Name', arabicNameKey: 'bg4Ar', descriptionKey: 'bg4Desc', price: 12, dietaryTags: [],        categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
      { id: 'bg5', nameKey: 'bg5Name', arabicNameKey: 'bg5Ar', descriptionKey: 'bg5Desc', price: 12, dietaryTags: ['vegan'], categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
      { id: 'bg6', nameKey: 'bg6Name', arabicNameKey: 'bg6Ar', descriptionKey: 'bg6Desc', price: 10, dietaryTags: [],        categoryKey: 'sectionBurger', image: IMG.burger, availability: { isAvailable: true } },
    ],
  },

  // ── SALATE / SALADS ────────────────────────────────────────────────────────
  {
    categoryKey: 'sectionSalads',
    arabicLabelKey: 'sectionSaladsArabic',
    items: [
      { id: 'sa1', nameKey: 'sa1Name', arabicNameKey: 'sa1Ar', descriptionKey: 'sa1Desc', price: 8,  dietaryTags: ['vegan'], categoryKey: 'sectionSalads', image: IMG.salad,   availability: { isAvailable: true } },
      { id: 'sa2', nameKey: 'sa2Name', arabicNameKey: 'sa2Ar', descriptionKey: 'sa2Desc', price: 10, dietaryTags: ['vegan'], categoryKey: 'sectionSalads', image: IMG.salad,   availability: { isAvailable: true } },
      { id: 'sa3', nameKey: 'sa3Name', arabicNameKey: 'sa3Ar', descriptionKey: 'sa3Desc', price: 10, dietaryTags: ['vegan'], categoryKey: 'sectionSalads', image: IMG.salad,   availability: { isAvailable: true } },
      { id: 'sa4', nameKey: 'sa4Name', arabicNameKey: 'sa4Ar', descriptionKey: 'sa4Desc', price: 12, dietaryTags: [],        categoryKey: 'sectionSalads', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'sa5', nameKey: 'sa5Name', arabicNameKey: 'sa5Ar', descriptionKey: 'sa5Desc', price: 12, dietaryTags: ['vegan'], categoryKey: 'sectionSalads', image: IMG.salad,   availability: { isAvailable: true } },
      { id: 'sa6', nameKey: 'sa6Name', arabicNameKey: 'sa6Ar', descriptionKey: 'sa6Desc', price: 13, dietaryTags: [],        categoryKey: 'sectionSalads', image: IMG.salad,   availability: { isAvailable: true } },
    ],
  },

  // ── KALTE GERICHTE / COLD DISHES ──────────────────────────────────────────
  {
    categoryKey: 'sectionColdDishes',
    arabicLabelKey: 'sectionColdDishesArabic',
    items: [
      { id: 'cd1', nameKey: 'cd1Name', arabicNameKey: 'cd1Ar', descriptionKey: 'cd1Desc', price: 9,  dietaryTags: ['vegan'],         categoryKey: 'sectionColdDishes', image: IMG.hummus, availability: { isAvailable: true } },
      { id: 'cd2', nameKey: 'cd2Name', arabicNameKey: 'cd2Ar', descriptionKey: 'cd2Desc', price: 9,  dietaryTags: [],                 categoryKey: 'sectionColdDishes', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'cd3', nameKey: 'cd3Name', arabicNameKey: 'cd3Ar', descriptionKey: 'cd3Desc', price: 10, dietaryTags: [],                 categoryKey: 'sectionColdDishes', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'cd4', nameKey: 'cd4Name', arabicNameKey: 'cd4Ar', descriptionKey: 'cd4Desc', price: 8,  dietaryTags: ['vegan', 'nuts'], categoryKey: 'sectionColdDishes', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'cd5', nameKey: 'cd5Name', arabicNameKey: 'cd5Ar', descriptionKey: 'cd5Desc', price: 12, dietaryTags: [],                 categoryKey: 'sectionColdDishes', isChefsChoice: true, image: IMG.mezze, availability: { isAvailable: true } },
      { id: 'cd6', nameKey: 'cd6Name', arabicNameKey: 'cd6Ar', descriptionKey: 'cd6Desc', price: 10, dietaryTags: ['vegan'],         categoryKey: 'sectionColdDishes', image: IMG.mezze,  availability: { isAvailable: true } },
    ],
  },

  // ── WARME GERICHTE / WARM DISHES ──────────────────────────────────────────
  {
    categoryKey: 'sectionWarmDishes',
    arabicLabelKey: 'sectionWarmDishesArabic',
    items: [
      { id: 'wm1', nameKey: 'wm1Name', arabicNameKey: 'wm1Ar', descriptionKey: 'wm1Desc', price: 12, dietaryTags: ['nuts'], categoryKey: 'sectionWarmDishes', image: IMG.hummus,  availability: { isAvailable: true } },
      { id: 'wm2', nameKey: 'wm2Name', arabicNameKey: 'wm2Ar', descriptionKey: 'wm2Desc', price: 12, dietaryTags: [],       categoryKey: 'sectionWarmDishes', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'wm3', nameKey: 'wm3Name', arabicNameKey: 'wm3Ar', descriptionKey: 'wm3Desc', price: 10, dietaryTags: [],       categoryKey: 'sectionWarmDishes', image: IMG.kibbeh,   availability: { isAvailable: true } },
      { id: 'wm4', nameKey: 'wm4Name', arabicNameKey: 'wm4Ar', descriptionKey: 'wm4Desc', price: 8,  dietaryTags: [],       categoryKey: 'sectionWarmDishes', image: IMG.kibbeh,   availability: { isAvailable: true } },
      { id: 'wm5', nameKey: 'wm5Name', arabicNameKey: 'wm5Ar', descriptionKey: 'wm5Desc', price: 7,  dietaryTags: [],       categoryKey: 'sectionWarmDishes', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'wm6', nameKey: 'wm6Name', arabicNameKey: 'wm6Ar', descriptionKey: 'wm6Desc', price: 8,  dietaryTags: [],       categoryKey: 'sectionWarmDishes', isChefsChoice: true, image: IMG.chicken, availability: { isAvailable: true } },
    ],
  },

  // ── VOM GRILL / GRILL ──────────────────────────────────────────────────────
  {
    categoryKey: 'sectionGrill',
    arabicLabelKey: 'sectionGrillArabic',
    items: [
      { id: 'gr1', nameKey: 'gr1Name', arabicNameKey: 'gr1Ar', descriptionKey: 'gr1Desc', price: 17, dietaryTags: [],               categoryKey: 'sectionGrill', image: IMG.grill,   availability: { isAvailable: true } },
      { id: 'gr2', nameKey: 'gr2Name', arabicNameKey: 'gr2Ar', descriptionKey: 'gr2Desc', price: 18, dietaryTags: [],               categoryKey: 'sectionGrill', image: IMG.lamb,    availability: { isAvailable: true } },
      { id: 'gr3', nameKey: 'gr3Name', arabicNameKey: 'gr3Ar', descriptionKey: 'gr3Desc', price: 16, dietaryTags: [],               categoryKey: 'sectionGrill', image: IMG.chicken, availability: { isAvailable: true } },
      { id: 'gr4', nameKey: 'gr4Name', arabicNameKey: 'gr4Ar', descriptionKey: 'gr4Desc', price: 25, dietaryTags: [],               categoryKey: 'sectionGrill', isChefsChoice: true, isHighMargin: true, image: IMG.grill, availability: { isAvailable: true } },
      { id: 'gr5', nameKey: 'gr5Name', arabicNameKey: 'gr5Ar', descriptionKey: 'gr5Desc', price: 57, dietaryTags: [],               categoryKey: 'sectionGrill', isHighMargin: true, image: IMG.grill,   availability: { isAvailable: true } },
    ],
  },

  // ── TELLER SPEZIALITÄTEN / PLATE SPECIALTIES ──────────────────────────────
  {
    categoryKey: 'sectionPlates',
    arabicLabelKey: 'sectionPlatesArabic',
    items: [
      { id: 'pl1',  nameKey: 'pl1Name',  arabicNameKey: 'pl1Ar',  descriptionKey: 'pl1Desc',  price: 11,   dietaryTags: ['vegan'],               categoryKey: 'sectionPlates', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'pl2',  nameKey: 'pl2Name',  arabicNameKey: 'pl2Ar',  descriptionKey: 'pl2Desc',  price: 12,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'pl3',  nameKey: 'pl3Name',  arabicNameKey: 'pl3Ar',  descriptionKey: 'pl3Desc',  price: 11,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'pl4',  nameKey: 'pl4Name',  arabicNameKey: 'pl4Ar',  descriptionKey: 'pl4Desc',  price: 12,   dietaryTags: ['vegan'],               categoryKey: 'sectionPlates', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'pl5',  nameKey: 'pl5Name',  arabicNameKey: 'pl5Ar',  descriptionKey: 'pl5Desc',  price: 13,   dietaryTags: ['vegan'],               categoryKey: 'sectionPlates', image: IMG.mezze,    availability: { isAvailable: true } },
      { id: 'pl6',  nameKey: 'pl6Name',  arabicNameKey: 'pl6Ar',  descriptionKey: 'pl6Desc',  price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'pl7',  nameKey: 'pl7Name',  arabicNameKey: 'pl7Ar',  descriptionKey: 'pl7Desc',  price: 15,   dietaryTags: [],                       categoryKey: 'sectionPlates', isChefsChoice: true, image: IMG.mezze, availability: { isAvailable: true } },
      { id: 'pl8',  nameKey: 'pl8Name',  arabicNameKey: 'pl8Ar',  descriptionKey: 'pl8Desc',  price: 20,   dietaryTags: [],                       categoryKey: 'sectionPlates', isChefsChoice: true, isHighMargin: true, image: IMG.mezze, availability: { isAvailable: true } },
      { id: 'pl9',  nameKey: 'pl9Name',  arabicNameKey: 'pl9Ar',  descriptionKey: 'pl9Desc',  price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'pl10', nameKey: 'pl10Name', arabicNameKey: 'pl10Ar', descriptionKey: 'pl10Desc', price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'pl11', nameKey: 'pl11Name', arabicNameKey: 'pl11Ar', descriptionKey: 'pl11Desc', price: 14,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'pl12', nameKey: 'pl12Name', arabicNameKey: 'pl12Ar', descriptionKey: 'pl12Desc', price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'pl13', nameKey: 'pl13Name', arabicNameKey: 'pl13Ar', descriptionKey: 'pl13Desc', price: 14,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.shawarma, availability: { isAvailable: true } },
      { id: 'pl14', nameKey: 'pl14Name', arabicNameKey: 'pl14Ar', descriptionKey: 'pl14Desc', price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.chicken,  availability: { isAvailable: true } },
      { id: 'pl15', nameKey: 'pl15Name', arabicNameKey: 'pl15Ar', descriptionKey: 'pl15Desc', price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.grill,    availability: { isAvailable: true } },
      { id: 'pl16', nameKey: 'pl16Name', arabicNameKey: 'pl16Ar', descriptionKey: 'pl16Desc', price: 12,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.grill,    availability: { isAvailable: true } },
      { id: 'pl17', nameKey: 'pl17Name', arabicNameKey: 'pl17Ar', descriptionKey: 'pl17Desc', price: 13,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.grill,    availability: { isAvailable: true } },
      { id: 'pl18', nameKey: 'pl18Name', arabicNameKey: 'pl18Ar', descriptionKey: 'pl18Desc', price: 14,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.chicken,  availability: { isAvailable: true } },
      { id: 'pl19', nameKey: 'pl19Name', arabicNameKey: 'pl19Ar', descriptionKey: 'pl19Desc', price: 14,   dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.wrap,     availability: { isAvailable: true } },
      { id: 'pl20', nameKey: 'pl20Name', arabicNameKey: 'pl20Ar', descriptionKey: 'pl20Desc', price: 12.5, dietaryTags: [],                       categoryKey: 'sectionPlates', image: IMG.grill,    availability: { isAvailable: true } },
    ],
  },

  // ── DESSERT ────────────────────────────────────────────────────────────────
  {
    categoryKey: 'sectionDesserts',
    arabicLabelKey: 'sectionDessertsArabic',
    items: [
      { id: 'de1', nameKey: 'de1Name', arabicNameKey: 'de1Ar', descriptionKey: 'de1Desc', price: 3, dietaryTags: [],        categoryKey: 'sectionDesserts', image: IMG.dessert, availability: { isAvailable: true } },
      { id: 'de2', nameKey: 'de2Name', arabicNameKey: 'de2Ar', descriptionKey: 'de2Desc', price: 3, dietaryTags: ['nuts'],  categoryKey: 'sectionDesserts', image: IMG.dessert, availability: { isAvailable: true } },
      { id: 'de3', nameKey: 'de3Name', arabicNameKey: 'de3Ar', descriptionKey: 'de3Desc', price: 4, dietaryTags: ['vegan'], categoryKey: 'sectionDesserts', image: IMG.dessert, availability: { isAvailable: true } },
      { id: 'de4', nameKey: 'de4Name', arabicNameKey: 'de4Ar', descriptionKey: 'de4Desc', price: 5, dietaryTags: [],        categoryKey: 'sectionDesserts', image: IMG.dessert, availability: { isAvailable: true } },
    ],
  },

  // ── BEILAGEN / SIDES ───────────────────────────────────────────────────────
  {
    categoryKey: 'sectionSides',
    arabicLabelKey: 'sectionSidesArabic',
    items: [
      { id: 'si1',  nameKey: 'si1Name',  arabicNameKey: 'si1Ar',  descriptionKey: 'si1Desc',  price: 5,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.soup,   availability: { isAvailable: true } },
      { id: 'si2',  nameKey: 'si2Name',  arabicNameKey: 'si2Ar',  descriptionKey: 'si2Desc',  price: 5,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.fries,  availability: { isAvailable: true } },
      { id: 'si3',  nameKey: 'si3Name',  arabicNameKey: 'si3Ar',  descriptionKey: 'si3Desc',  price: 5,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si4',  nameKey: 'si4Name',  arabicNameKey: 'si4Ar',  descriptionKey: 'si4Desc',  price: 3.5, dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.salad,  availability: { isAvailable: true } },
      { id: 'si5',  nameKey: 'si5Name',  arabicNameKey: 'si5Ar',  descriptionKey: 'si5Desc',  price: 3,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si6',  nameKey: 'si6Name',  arabicNameKey: 'si6Ar',  descriptionKey: 'si6Desc',  price: 3,   dietaryTags: [],        categoryKey: 'sectionSides', image: IMG.halloumi, availability: { isAvailable: true } },
      { id: 'si7',  nameKey: 'si7Name',  arabicNameKey: 'si7Ar',  descriptionKey: 'si7Desc',  price: 2,   dietaryTags: [],        categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si8',  nameKey: 'si8Name',  arabicNameKey: 'si8Ar',  descriptionKey: 'si8Desc',  price: 2,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si9',  nameKey: 'si9Name',  arabicNameKey: 'si9Ar',  descriptionKey: 'si9Desc',  price: 3,   dietaryTags: [],        categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si10', nameKey: 'si10Name', arabicNameKey: 'si10Ar', descriptionKey: 'si10Desc', price: 6,   dietaryTags: [],        categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si11', nameKey: 'si11Name', arabicNameKey: 'si11Ar', descriptionKey: 'si11Desc', price: 3,   dietaryTags: ['vegan'], categoryKey: 'sectionSides', image: IMG.mezze,  availability: { isAvailable: true } },
      { id: 'si12', nameKey: 'si12Name', arabicNameKey: 'si12Ar', descriptionKey: 'si12Desc', price: 7,   dietaryTags: [],        categoryKey: 'sectionSides', image: IMG.shawarma, availability: { isAvailable: true } },
    ],
  },

  // ── FRISCH GEPRESSTE SÄFTE / FRESH JUICES ─────────────────────────────────
  {
    categoryKey: 'sectionJuices',
    arabicLabelKey: 'sectionJuicesArabic',
    items: [
      { id: 'fj1', nameKey: 'fj1Name', arabicNameKey: 'fj1Ar', descriptionKey: 'fj1Desc', price: 6, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionJuices', image: IMG.juice,  availability: { isAvailable: true } },
      { id: 'fj2', nameKey: 'fj2Name', arabicNameKey: 'fj2Ar', descriptionKey: 'fj2Desc', price: 6, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionJuices', image: IMG.juice,  availability: { isAvailable: true } },
      { id: 'fj3', nameKey: 'fj3Name', arabicNameKey: 'fj3Ar', descriptionKey: 'fj3Desc', price: 6, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionJuices', image: IMG.juice,  availability: { isAvailable: true } },
      { id: 'fj4', nameKey: 'fj4Name', arabicNameKey: 'fj4Ar', descriptionKey: 'fj4Desc', price: 7, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionJuices', image: IMG.juice,  availability: { isAvailable: true } },
      { id: 'fj5', nameKey: 'fj5Name', arabicNameKey: 'fj5Ar', descriptionKey: 'fj5Desc', price: 7, dietaryTags: [],                       categoryKey: 'sectionJuices', image: IMG.juice,  availability: { isAvailable: true } },
      { id: 'fj6', nameKey: 'fj6Name', arabicNameKey: 'fj6Ar', descriptionKey: 'fj6Desc', price: 7, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionJuices', image: IMG.drink,  availability: { isAvailable: true } },
    ],
  },

  // ── WARME GETRÄNKE / HOT DRINKS ────────────────────────────────────────────
  {
    categoryKey: 'sectionHotDrinks',
    arabicLabelKey: 'sectionHotDrinksArabic',
    items: [
      { id: 'hd1', nameKey: 'hd1Name', arabicNameKey: 'hd1Ar', descriptionKey: 'hd1Desc', price: 2.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd2', nameKey: 'hd2Name', arabicNameKey: 'hd2Ar', descriptionKey: 'hd2Desc', price: 2.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd3', nameKey: 'hd3Name', arabicNameKey: 'hd3Ar', descriptionKey: 'hd3Desc', price: 3.5, dietaryTags: [],                       categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd4', nameKey: 'hd4Name', arabicNameKey: 'hd4Ar', descriptionKey: 'hd4Desc', price: 3.5, dietaryTags: [],                       categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd5', nameKey: 'hd5Name', arabicNameKey: 'hd5Ar', descriptionKey: 'hd5Desc', price: 3,   dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd6', nameKey: 'hd6Name', arabicNameKey: 'hd6Ar', descriptionKey: 'hd6Desc', price: 3.5, dietaryTags: [],                       categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd7', nameKey: 'hd7Name', arabicNameKey: 'hd7Ar', descriptionKey: 'hd7Desc', price: 3.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
      { id: 'hd8', nameKey: 'hd8Name', arabicNameKey: 'hd8Ar', descriptionKey: 'hd8Desc', price: 2,   dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionHotDrinks', image: IMG.coffee, availability: { isAvailable: true } },
    ],
  },

  // ── KALTE GETRÄNKE / COLD DRINKS ──────────────────────────────────────────
  {
    categoryKey: 'sectionColdDrinks',
    arabicLabelKey: 'sectionColdDrinksArabic',
    items: [
      { id: 'kd1', nameKey: 'kd1Name', arabicNameKey: 'kd1Ar', descriptionKey: 'kd1Desc', price: 2,   dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd2', nameKey: 'kd2Name', arabicNameKey: 'kd2Ar', descriptionKey: 'kd2Desc', price: 2,   dietaryTags: [],                       categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd3', nameKey: 'kd3Name', arabicNameKey: 'kd3Ar', descriptionKey: 'kd3Desc', price: 2,   dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd4', nameKey: 'kd4Name', arabicNameKey: 'kd4Ar', descriptionKey: 'kd4Desc', price: 2,   dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd5', nameKey: 'kd5Name', arabicNameKey: 'kd5Ar', descriptionKey: 'kd5Desc', price: 2.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd6', nameKey: 'kd6Name', arabicNameKey: 'kd6Ar', descriptionKey: 'kd6Desc', price: 2.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd7', nameKey: 'kd7Name', arabicNameKey: 'kd7Ar', descriptionKey: 'kd7Desc', price: 2.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
      { id: 'kd8', nameKey: 'kd8Name', arabicNameKey: 'kd8Ar', descriptionKey: 'kd8Desc', price: 1.5, dietaryTags: ['vegan', 'gluten-free'], categoryKey: 'sectionColdDrinks', image: IMG.drink, availability: { isAvailable: true } },
    ],
  },

  // ── TRADITIONELLE SPEZIALITÄTEN / TRADITIONAL SPECIALS ────────────────────
  {
    categoryKey: 'sectionSpecials',
    arabicLabelKey: 'sectionSpecialsArabic',
    items: [
      { id: 'sp1',  nameKey: 'sp1Name',  arabicNameKey: 'sp1Ar',  descriptionKey: 'sp1Desc',  price: 12, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.chicken, availability: { isAvailable: true } },
      { id: 'sp2',  nameKey: 'sp2Name',  arabicNameKey: 'sp2Ar',  descriptionKey: 'sp2Desc',  price: 14, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.mezze,   availability: { isAvailable: true } },
      { id: 'sp3',  nameKey: 'sp3Name',  arabicNameKey: 'sp3Ar',  descriptionKey: 'sp3Desc',  price: 12, dietaryTags: ['nuts'],                 categoryKey: 'sectionSpecials', image: IMG.kibbeh,  availability: { isAvailable: true } },
      { id: 'sp4',  nameKey: 'sp4Name',  arabicNameKey: 'sp4Ar',  descriptionKey: 'sp4Desc',  price: 12, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.mezze,   availability: { isAvailable: true } },
      { id: 'sp5',  nameKey: 'sp5Name',  arabicNameKey: 'sp5Ar',  descriptionKey: 'sp5Desc',  price: 14, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.mezze,   availability: { isAvailable: true } },
      { id: 'sp6',  nameKey: 'sp6Name',  arabicNameKey: 'sp6Ar',  descriptionKey: 'sp6Desc',  price: 14, dietaryTags: [],                       categoryKey: 'sectionSpecials', isChefsChoice: true, image: IMG.chicken, availability: { isAvailable: true } },
      { id: 'sp7',  nameKey: 'sp7Name',  arabicNameKey: 'sp7Ar',  descriptionKey: 'sp7Desc',  price: 14, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.mezze,   availability: { isAvailable: true } },
      { id: 'sp8',  nameKey: 'sp8Name',  arabicNameKey: 'sp8Ar',  descriptionKey: 'sp8Desc',  price: 14, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.grill,   availability: { isAvailable: true } },
      { id: 'sp9',  nameKey: 'sp9Name',  arabicNameKey: 'sp9Ar',  descriptionKey: 'sp9Desc',  price: 12, dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.mezze,   availability: { isAvailable: true } },
      { id: 'sp10', nameKey: 'sp10Name', arabicNameKey: 'sp10Ar', descriptionKey: 'sp10Desc', price: 7,  dietaryTags: ['nuts'],                 categoryKey: 'sectionSpecials', image: IMG.dessert, availability: { isAvailable: true } },
      { id: 'sp11', nameKey: 'sp11Name', arabicNameKey: 'sp11Ar', descriptionKey: 'sp11Desc', price: 7,  dietaryTags: [],                       categoryKey: 'sectionSpecials', image: IMG.dessert, availability: { isAvailable: true } },
    ],
  },
];
