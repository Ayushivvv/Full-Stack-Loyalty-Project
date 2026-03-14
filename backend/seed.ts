import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  await prisma.user.createMany({
    data: [
      {
        utorid: "tstark",
        password: "IronMan2023!",
        name: "Tony Stark",
        email: "tony.stark@mail.utoronto.c",
        verified: true,
        role: "superuser",
        points: 0,
        birthday: new Date("1980-07-20"),
        createdAt: new Date("2025-11-23T16:47:05.214"),
        lastLogin: new Date("2025-11-28T16:47:05.214"),
        suspicious: false,
        activated: true
      },
      {
        utorid: "capamerica",
        password: "America1940!",
        name: "Steve Rogers",
        email: "steve123@mail.utoronto.ca",
        verified: true,
        role: "superuser",
        points: 170,
        birthday: new Date("1970-09-01"),
        createdAt: new Date("2025-11-26T00:35:11.374"),
        lastLogin: new Date("2025-12-01T04:59:27.76"),
        avatarUrl: "https://i.redd.it/c3b5xyglhfie1.jpeg",
        suspicious: false,
        activated: true
      },
      {
        utorid: "barfi2023",
        password: "BestCatEver!",
        email: "barfi.s@mail.utoronto.ca",
        verified: true,
        role: "superuser",
        points: 6262,
        createdAt: new Date("2025-11-25T00:13:40.119"),
        lastLogin: new Date("2025-11-25T04:13:40.119"),
        suspicious: false,
        activated: true
      },
      {
        utorid: "natromanoff",
        password: "RedHead#123",
        name: "Natasha Romanoff",
        email: "natasha.romanoff@mail.utoronto.ca",
        verified: true,
        role: "manager",
        points: 0,
        birthday: new Date("1990-02-01"),
        createdAt: new Date("2025-12-01T01:32:14.458"),
        lastLogin: new Date("2025-12-01T01:42:14.458"),
        avatarUrl: "https://i.pinimg.com/736x/79/d2/7d/79d27d0c1313afa56383943b85ec95dd.jpg",
        suspicious: false,
        activated: true
      },
      {
        utorid: "parkerpeter",
        password: "Spider^200",
        name: "Peter Parker",
        email: "p.parker@mail.utoronto.ca",
        verified: true,
        role: "manager",
        points: 100,
        createdAt: new Date("2025-11-26T22:18:05.539"),
        lastLogin: new Date("2025-11-30T10:09:47.3"),
        avatarUrl: "https://i.pinimg.com/736x/c2/17/a2/c217a2a4839e1ede34661aa279e05417.jpg",
        suspicious: false,
        activated: true
      },
      {
        utorid: "capmarvel",
        password: "StrongestAvenger22!",
        name: "Carol Danvers",
        email: "cdanvers@mail.utoronto.ca",
        verified: false,
        role: "cashier",
        points: 0,
        birthday: new Date("2000-01-01"),
        createdAt: new Date("2025-12-01T04:59:27.76"),
        lastLogin: new Date("2025-12-01T04:59:50.76"),
        avatarUrl: "https://images.litter-robot.com/media/wysiwyg/orange-tabby-outside.png",
        suspicious: true,
        activated: true
      },
      {
        utorid: "odinsonthor",
        password: "222Thunder!",
        name: "Thor Odinson",
        email: "thor@mail.utoronto.ca",
        verified: true,
        role: "cashier",
        points: 496,
        createdAt: new Date("2025-12-01T04:46:52.613"),
        lastLogin: new Date("2025-12-01T04:59:27.76"),
        suspicious: false,
        activated: true
      },
      {
        utorid: "loki4545",
        password: "Tesseract321!",
        name: "Loki Laufeyson",
        email: "loki@mail.utoronto.ca",
        verified: false,
        role: "regular",
        points: 100,
        birthday: new Date("2005-02-01"),
        createdAt: new Date("2025-11-26T02:34:29.509"),
        lastLogin: new Date("2025-11-26T02:34:29.509"),
        avatarUrl: "https://i.pinimg.com/736x/2b/24/22/2b2422be536bd0e2d360afb61ff51d9e.jpg",
        suspicious: true,
        activated: false
      },
      {
        utorid: "grooot",
        password: "Tree!Tre3",
        name: "Groot",
        email: "groot@mail.utoronto.ca",
        verified: true,
        role: "regular",
        points: 778,
        createdAt: new Date("2025-11-27T15:30:45.364"),
        lastLogin: new Date("2025-11-27T15:54:31.039"),
        suspicious: false,
        activated: true
      },
      {
        utorid: "maximoffm",
        password: "ScarletW1tch!",
        name: "Wanda Maximoff",
        email: "w.maximoff@mail.utoronto.ca",
        verified: true,
        role: "regular",
        points: 100,
        birthday: new Date("2001-04-29"),
        createdAt: new Date("2025-11-19T15:55:16.242"),
        lastLogin: new Date("2025-11-29T15:55:16.242"),
        avatarUrl: "https://upload.wikimedia.org/wikipedia/en/d/d9/Elizabeth Olsen as Wanda Maximoff.jpg",
        suspicious: true,
        activated: true
      },
      
    ],
  });

  await prisma.event.createMany({
    data: [
        {
            startTime: new Date("2025-11-27T13:50:00"),
            endTime: new Date("2025-11-27T15:50:00"),
            location: "Eaton Centre",
            description: "Grand opening of renovated Artizia store",
            capacity: 300,
            points: 1000,
            name: "Aritzia's Grand Opening",
            pointsRemain: 350,
            pointsAwarded: 150,
            published: true,
            numGuests:2
        },
        {
            startTime: new Date("2025-11-29T12:40:00"),
            endTime: new Date("2025-11-29T13:40:00"),
            location: "Yorkdale Mall",
            description: "Christmas tree and lights go up",
            capacity: 500,
            points: 2000,
            name: "Christmas Tree Ceremony",
            pointsRemain: 1600,
            pointsAwarded: 400,
            published: true,
            numGuests:4
        },
        {
            startTime: new Date("2025-12-04T14:50:00"),
            endTime: new Date("2025-12-04T16:50:00"),
            location: "CN Tower",
            description: "Brunch at the top of CN Tower",
            capacity: 100,
            points: 1300,
            name: "Brunch at the Top",
            pointsRemain: 1300,
            pointsAwarded: 0,
            published: true,
            numGuests:0
        },
        {
            startTime: new Date("2025-12-14T00:00:00"),
            endTime: new Date("2025-12-14T02:00:00Z"),
            location: "Niagara Falls",
            description: "Ferry across the falls",
            capacity: 150,
            points: 200,
            name: "Late Night Ferry",
            pointsRemain: 200,
            pointsAwarded: 0,
            published: true,
            numGuests:0
        },
        {
            startTime: new Date("2025-12-17T12:30:00Z"),
            endTime: new Date("2025-12-17T16:30:00Z"),
            location: "Burj Khalifa",
            description: "Exclusive high tea event",
            capacity: 20,
            points: 15000,
            name: "High Tea in the Sky",
            pointsRemain: 15000,
            pointsAwarded: 0,
            published: false,
            numGuests:0
        },
        {
            startTime: new Date("2025-12-28T11:45:00"),
            endTime: new Date("2025-12-28T12:45:00"),
            location: "Taj Mahal",
            description: "Sightseeing tour of the property",
            capacity: 75,
            points: 300,
            name: "Taj Mahal: The Tour",
            pointsRemain: 300,
            pointsAwarded: 0,
            published: true,
            numGuests:0
        }
        
    ]});

    await prisma.promotion.createMany({
        data: [
            {
                name: "BOGO",
                minSpending: 100,
                rate: 0,
                points: 100,
                description: "Buy one get one free",
                type: "onetime",
                startTime: new Date("2025-11-20"),
                endTime: new Date("2025-11-25")
            },
            {
                name: "20% over $100",
                minSpending: 100,
                rate: 0,
                points: 0,
                description: "20% off when spending $100+",
                type: "automatic",
                startTime: new Date("2025-11-27"),
                endTime: new Date("2025-11-30")
            },
            {
                name: "Black Friday Deal",
                minSpending: 0,
                rate: 5,
                points: 200,
                description: "50% off everything for Black Friday",
                type: "automatic",
                startTime: new Date("2025-11-28"),
                endTime: new Date("2025-11-29")
            },
            {
                name: "Holiday Deal",
                minSpending: 200,
                rate: 0,
                points: 0,
                description: "Free stocking with purchase",
                type: "onetime",
                startTime: new Date("2025-12-01"),
                endTime: new Date("2025-12-26")
            },
            {
                name: "Boxing Day Deal",
                minSpending: 0,
                rate: 5,
                points: 20,
                description: "30% off everything",
                type: "automatic",
                startTime: new Date("2025-12-26"),
                endTime: new Date("2025-12-27")
            },
            {
                name: "Crazy Summer Deal",
                minSpending: 50,
                rate: 10,
                points: 500,
                description: "Buy one get one 50% off",
                type: "onetime",
                startTime: new Date("2026-06-01"),
                endTime: new Date("2026-06-20")
            }
        ]});

        await prisma.transaction.createMany({
            data: [
                {
                    utorid: "grooot",
                    type: "purchase",
                    date: new Date("2025-11-27T05:09:25.915"),
                    spent: 20,
                    earned: 80,
                    remark: "Bought a red shirt",
                    createdBy: "capmarvel",
                    amount: 0,
                    suspicious: false,
                },
                {
                    utorid: "odinsonthor",
                    type: "purchase",
                    date: new Date("2025-11-29T00:51:26.184"),
                    spent: 100,
                    earned: 400,
                    remark: "Bought cat treats",
                    createdBy: "tstark",
                    amount: 400,
                    suspicious: false,
                },
                {
                    utorid: "capamerica",
                    type: "purchase",
                    date: new Date("2025-11-29T06:54:56.129"),
                    spent: 50,
                    earned: 200,
                    createdBy: "barfi2023",
                    amount: 200,
                    suspicious: false,
                },
                {
                    utorid: "loki4545",
                    type: "purchase",
                    date: new Date("2025-11-30T01:07:59.543"),
                    spent: 200,
                    earned: 800,
                    remark: "Bought fake tesseract",
                    createdBy: "odinsonthor",
                    amount: 0,
                    suspicious: true,
                },
                {
                    utorid: "barfi2023",
                    type: "purchase",
                    date: new Date("2025-11-30T02:10:59.555"),
                    spent: 1500,
                    earned: 6000,
                    remark: "Bought churu",
                    createdBy: "odinsonthor",
                    amount: 6000,
                    suspicious: false,
                },
                {
                    utorid: "grooot",
                    type: "purchase",
                    date: new Date("2025-12-01T02:39:47.955"),
                    spent: 10,
                    earned: 40,
                    createdBy: "tstark",
                    amount: 40,
                    suspicious: false,
                },
                {
                    utorid: "barfi2023",
                    type: "adjustment",
                    date: new Date("2025-12-01T02:56:45.805"),
                    remark: "deserves more points",
                    createdBy: "tstark",
                    amount: 200,
                    relatedId: 5,
                    suspicious: false
                },
                {
                    utorid: "thorodinson",
                    type: "adjustment",
                    date: new Date("2025-12-01T04:30:40.000"),
                    createdBy: "capamerica",
                    amount: -2,
                    relatedId: 2,
                    suspicious: false
                },
                {
                    utorid: "barfi2023",
                    type: "adjustment",
                    date: new Date("2025-12-01"),
                    remark: "miscalculation",
                    createdBy: "tstark",
                    amount: 100,
                    relatedId: 5,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "adjustment",
                    date: new Date("2025-12-02T01:23:00.450"),
                    createdBy: "natromanoff",
                    amount: 40,
                    relatedId: 6,
                    suspicious: false
                },
                {
                    utorid: "capamerica",
                    type: "adjustment",
                    date: new Date("2025-12-02T05:55:03.451"),
                    createdBy: "tstark",
                    amount: -30,
                    relatedId: 3,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "adjustment",
                    date: new Date("2025-12-02T08:55:03.451"),
                    remark: "Inconvenience fee",
                    createdBy: "parkerpeter",
                    amount: 50,
                    relatedId: 1,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "redemption",
                    date: new Date("2025-12-02T10:55:03.451"),
                    redeemed: 10,
                    remark: "for another free coffee",
                    createdBy: "grooot",
                    amount: 10,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "redemption",
                    date: new Date("2025-12-02T09:55:03.451"),
                    redeemed: 10,
                    remark: "for free coffee",
                    createdBy: "grooot",
                    amount: 10,
                    suspicious: false
                },
                {
                    utorid: "barfi2023",
                    type: "redemption",
                    date: new Date("2025-12-02T10:56:03.451"),
                    redeemed: 20,
                    remark: "for free treat",
                    createdBy: "barfi2023",
                    amount: 20,
                    suspicious: false
                },
                {
                    utorid: "odinsonthor",
                    type: "redemption",
                    date: new Date("2025-12-02T10:57:03.451"),
                    redeemed: 2,
                    createdBy: "odinsonthor",
                    amount: 2,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "redemption",
                    date: new Date("2025-12-02T10:57:03.471"),
                    redeemed: 10,
                    createdBy: "grooot",
                    amount: 10,
                    suspicious: false
                },
                {
                    utorid: "barfi2023",
                    type: "redemption",
                    date: new Date("2025-12-02T10:57:05.471"),
                    redeemed: 20,
                    remark: "for another free treat",
                    createdBy: "barfi2023",
                    amount: 20,
                    suspicious: false
                },
                {
                    utorid: "barfi2023",
                    type: "transfer",
                    date: new Date("2025-12-02T10:59:05.471"),
                    spent: 100,
                    remark: "Birthday surprise",
                    createdBy: "barfi2023",
                    amount: -100,
                    relatedId: 10,
                    suspicious: false,
                    sender: "barfi2023",
                    recepient:"maximoffm",
                    sent: 100
                },
                {
                    utorid: "maximoffm",
                    type: "transfer",
                    date: new Date("2025-12-02T10:59:05.471"),
                    earned: 100,
                    remark: "Birthday surprise",
                    createdBy: "barfi2023",
                    amount: 100,
                    relatedId: 3,
                    suspicious: false,
                    sender: "barfi2023",
                    recepient:"maximoffm"
                },
                {
                    utorid: "grooot",
                    type: "transfer",
                    date: new Date("2025-12-02T10:59:08.471"),
                    spent: 2,
                    createdBy: "grooot",
                    amount: -2,
                    relatedId: 3,
                    suspicious: false,
                    sender: "grooot",
                    recepient:"barfi2023",
                    sent: 2
                },
                {
                    utorid: "barfi2023",
                    type: "transfer",
                    date: new Date("2025-12-02T10:59:08.471"),
                    earned: 2,
                    createdBy: "grooot",
                    amount: 2,
                    relatedId: 9,
                    suspicious: false,
                    sender: "grooot",
                    recepient:"barfi2023"
                },
                {
                    utorid: "barfi2023",
                    type: "transfer",
                    date: new Date("2025-12-03T10:59:08.471"),
                    spent: 100,
                    remark: "Charity",
                    createdBy: "barfi2023",
                    amount: -100,
                    relatedId: 5,
                    suspicious: false,
                    sender: "barfi2023",
                    recepient:"parkerpeter",
                    sent: 100
                },
                {
                    utorid: "parkerpeter",
                    type: "transfer",
                    date: new Date("2025-12-03T10:59:08.471"),
                    earned: 100,
                    remark: "Charity",
                    createdBy: "barfi2023",
                    amount: 100,
                    relatedId: 3,
                    suspicious: false,
                    sender: "barfi2023",
                    recepient:"maximoffm"
                },
                {
                    utorid: "barfi2023",
                    type: "event",
                    date: new Date("2025-12-03T10:59:08.500"),
                    earned: 100,
                    remark: "Won game",
                    createdBy: "tstark",
                    amount: 100,
                    relatedId: 1,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "event",
                    date: new Date("2025-12-03T10:59:08.600"),
                    earned: 500,
                    createdBy: "capamerica",
                    amount: 500,
                    relatedId: 1,
                    suspicious: false
                },
                {
                    utorid: "grooot",
                    type: "event",
                    date: new Date("2025-12-03T11:59:08.600"),
                    earned: 100,
                    remark: "Everyone gets points",
                    createdBy: "parkerpeter",
                    amount: 100,
                    relatedId: 2,
                    suspicious: false
                },
                {
                    utorid: "barfi2023",
                    type: "event",
                    date: new Date("2025-12-03T11:59:08.600"),
                    earned: 100,
                    remark: "Everyone gets points",
                    createdBy: "parkerpeter",
                    amount: 100,
                    relatedId: 2,
                    suspicious: false
                },
                {
                    utorid: "loki4545",
                    type: "event",
                    date: new Date("2025-12-03T11:59:08.600"),
                    earned: 100,
                    remark: "Everyone gets points",
                    createdBy: "parkerpeter",
                    amount: 100,
                    relatedId: 2,
                    suspicious: false
                },
                {
                    utorid: "odinsonthor",
                    type: "event",
                    date: new Date("2025-12-03T11:59:08.600"),
                    earned: 100,
                    remark: "Everyone gets points",
                    createdBy: "parkerpeter",
                    amount: 100,
                    relatedId: 2,
                    suspicious: false
                }
            ]});
}

main();