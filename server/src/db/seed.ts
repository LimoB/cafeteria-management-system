import { db } from './instance';
import { menu, locations, admins, users } from '../config/schema';
import bcrypt from 'bcryptjs';
import pc from 'picocolors';

async function seed() {
  const line = pc.gray("─".repeat(60));
  console.log(line);
  console.log(pc.green(pc.bold("🌱 LAIKIPIA CANTEEN DATABASE SEEDER (RESTORE MODE)")));
  console.log(line);

  try {
    const saltRounds = 12;

    // 🔐 ADMINS
    console.log(pc.cyan("🔐 Seeding Admins..."));
    const adminPass = await bcrypt.hash("admin123", saltRounds);

    await db.insert(admins).values([
      { name: "Alice Wanjiku", username: "admin_alice", password: adminPass },
      { name: "James Otieno", username: "manager_james", password: adminPass },
      { name: "Boaz Kipchirchir", username: "boaz_dev", password: adminPass }
    ]).onConflictDoNothing(); // <--- This prevents the crash if users exist

    // 🎓 USERS (Expanded Student List)
    console.log(pc.cyan("🎓 Seeding Students..."));
    const userPass = await bcrypt.hash("student123", saltRounds);

    await db.insert(users).values([
      {
        name: "Brian Mwangi",
        email: "brian@student.lu.ac.ke",
        phone: "254798765432",
        registerNumber: "S13/00045/23",
        department: "Information Technology",
        username: "brian_it",
        graduationYear: 2027,
        password: userPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian"
      },
      {
        name: "Faith Njeri",
        email: "faith@student.lu.ac.ke",
        phone: "254711223344",
        registerNumber: "S13/00078/22",
        department: "Business Administration",
        username: "faith_biz",
        graduationYear: 2026,
        password: userPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Faith"
      },
      {
        name: "Kevin Koech",
        email: "kevin@student.lu.ac.ke",
        phone: "254700112233",
        registerNumber: "S11/00551/24",
        department: "Computer Science",
        username: "kevo_cs",
        graduationYear: 2028,
        password: userPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin"
      },
      {
        name: "Stacy Chebet",
        email: "stacy@student.lu.ac.ke",
        phone: "254722334455",
        registerNumber: "S15/00992/23",
        department: "Nursing",
        username: "stacy_che",
        graduationYear: 2027,
        password: userPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stacy"
      },
      {
        name: "Dennis Omari",
        email: "dennis@student.lu.ac.ke",
        phone: "254755667788",
        registerNumber: "A11/00122/22",
        department: "Education",
        username: "denno_omari",
        graduationYear: 2026,
        password: userPass,
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dennis"
      }
    ]).onConflictDoNothing();

    // 📍 LOCATIONS
    console.log(pc.cyan("📍 Seeding Locations..."));
    await db.insert(locations).values([
      { name: "Main Canteen - Window A" },
      { name: "Main Canteen - Window B" },
      { name: "Science Complex Juice Bar" },
      { name: "LKC Staff Lounge" }
    ]).onConflictDoNothing();

    // 🍱 MENU
    console.log(pc.cyan("🍱 Seeding Menu & Combos..."));
    await db.insert(menu).values([
      { foodName: "Ugali + Sukuma + Beef", price: 180, isAvailable: true, category: "Combo" },
      { foodName: "Rice + Beans + Cabbage", price: 120, isAvailable: true, category: "Combo" },
      { foodName: "Chapati (2) + Ndengu", price: 90, isAvailable: true, category: "Combo" },
      { foodName: "Chips + Sausage (2)", price: 180, isAvailable: true, category: "Combo" },
      { foodName: "Githeri + Avocado", price: 80, isAvailable: true, category: "Combo" },
      { foodName: "Mukimo + Beef Stew", price: 170, isAvailable: true, category: "Combo" },
      { foodName: "Pilau + Kachumbari + Soda", price: 200, isAvailable: true, category: "Combo" },
      { foodName: "Tea", price: 20, isAvailable: true, category: "Breakfast" },
      { foodName: "Mandazi", price: 15, isAvailable: true, category: "Breakfast" },
      { foodName: "Chapati", price: 20, isAvailable: true, category: "Breakfast" },
      { foodName: "Boiled Eggs", price: 20, isAvailable: true, category: "Breakfast" },
      { foodName: "Ugali", price: 30, isAvailable: true, category: "Lunch" },
      { foodName: "Rice", price: 50, isAvailable: true, category: "Lunch" },
      { foodName: "Beef Stew", price: 120, isAvailable: true, category: "Lunch" },
      { foodName: "Beans", price: 70, isAvailable: true, category: "Lunch" },
      { foodName: "Chips", price: 100, isAvailable: true, category: "Snacks" },
      { foodName: "Soda 300ml", price: 60, isAvailable: true, category: "Drinks" }
    ]).onConflictDoNothing();

    console.log(line);
    console.log(pc.green(pc.bold("✅ SEED COMPLETE (CLEAN RUN)")));
    console.log(pc.white(`Access: ${pc.yellow("boaz_dev")} | ${pc.yellow("kevo_cs")}`));
    console.log(line);

  } catch (error) {
    console.error(pc.red("❌ Seeding failed:"), error);
  } finally {
    process.exit(0);
  }
}

seed();