import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
    const history = useNavigate();
    //state data
    const [isDashboard, setIsDashboard] = useState(false);
    const [isApps, setIsApps] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [isPages, setIsPages] = useState(false);
    const [isBaseUi, setIsBaseUi] = useState(false);
    const [isAdvanceUi, setIsAdvanceUi] = useState(false);
    const [isForms, setIsForms] = useState(false);
    const [isTables, setIsTables] = useState(false);
    const [isCharts, setIsCharts] = useState(false);
    const [isIcons, setIsIcons] = useState(false);
    const [isMaps, setIsMaps] = useState(false);
    const [isMultiLevel, setIsMultiLevel] = useState(false);

    // Apps
    const [isEmail, setEmail] = useState(false);
    const [isSubEmail, setSubEmail] = useState(false);
    const [isEcommerce, setIsEcommerce] = useState(false);
    const [isProjects, setIsProjects] = useState(false);
    const [isTasks, setIsTasks] = useState(false);
    const [isCRM, setIsCRM] = useState(false);
    const [isCrypto, setIsCrypto] = useState(false);
    const [isInvoices, setIsInvoices] = useState(false);
    const [isSupportTickets, setIsSupportTickets] = useState(false);
    const [isNFTMarketplace, setIsNFTMarketplace] = useState(false);
    const [isJobs, setIsJobs] = useState(false);
    const [isJobList, setIsJobList] = useState(false);
    const [isCandidateList, setIsCandidateList] = useState(false);


    // Authentication
    const [isSignIn, setIsSignIn] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [isPasswordCreate, setIsPasswordCreate] = useState(false);
    const [isLockScreen, setIsLockScreen] = useState(false);
    const [isLogout, setIsLogout] = useState(false);
    const [isSuccessMessage, setIsSuccessMessage] = useState(false);
    const [isVerification, setIsVerification] = useState(false);
    const [isError, setIsError] = useState(false);

    // Pages
    const [isProfile, setIsProfile] = useState(false);
    const [isLanding, setIsLanding] = useState(false);


    // Charts
    const [isApex, setIsApex] = useState(false);

    // Multi Level
    const [isLevel1, setIsLevel1] = useState(false);
    const [isLevel2, setIsLevel2] = useState(false);

    const [iscurrentState, setIscurrentState] = useState('Dashboard');

    function updateIconSidebar(e) {
        if (e && e.target && e.target.getAttribute("subitems")) {
            const ul = document.getElementById("two-column-menu");
            const iconItems = ul.querySelectorAll(".nav-icon.active");
            let activeIconItems = [...iconItems];
            activeIconItems.forEach((item) => {
                item.classList.remove("active");
                var id = item.getAttribute("subitems");
                if (document.getElementById(id))
                    document.getElementById(id).classList.remove("show");
            });
        }
    }

    useEffect(() => {
        document.body.classList.remove('twocolumn-panel');
        if (iscurrentState !== 'Dashboard') {
            setIsDashboard(false);
        }
        if (iscurrentState !== 'Apps') {
            setIsApps(false);
        }
        if (iscurrentState !== 'Auth') {
            setIsAuth(false);
        }
        if (iscurrentState !== 'Pages') {
            setIsPages(false);
        }
        if (iscurrentState !== 'BaseUi') {
            setIsBaseUi(false);
        }
        if (iscurrentState !== 'AdvanceUi') {
            setIsAdvanceUi(false);
        }
        if (iscurrentState !== 'Forms') {
            setIsForms(false);
        }
        if (iscurrentState !== 'Tables') {
            setIsTables(false);
        }
        if (iscurrentState !== 'Charts') {
            setIsCharts(false);
        }
        if (iscurrentState !== 'Icons') {
            setIsIcons(false);
        }
        if (iscurrentState !== 'Maps') {
            setIsMaps(false);
        }
        if (iscurrentState !== 'MuliLevel') {
            setIsMultiLevel(false);
        }
        if (iscurrentState === 'Widgets') {
            history("/widgets");
            document.body.classList.add('twocolumn-panel');
        }
        if (iscurrentState !== 'Landing') {
            setIsLanding(false);
        }
    }, [
        history,
        iscurrentState,
        isDashboard,
        isApps,
        isAuth,
        isPages,
        isBaseUi,
        isAdvanceUi,
        isForms,
        isTables,
        isCharts,
        isIcons,
        isMaps,
        isMultiLevel
    ]);

    const menuItems = [
        {
            label: "Menu",
            isHeader: true,
        },
        {
            id: "dashboard",
            label: "Dashboards",
            icon: "ri-dashboard-2-line",
            link: "/",
            stateVariables: isDashboard,
            click: function (e) {
                e.preventDefault();
                setIsDashboard(!isDashboard);
                setIscurrentState('Dashboard');
                updateIconSidebar(e);
                history('/')
            },
            subItems: [
                {
                    id: "analytics",
                    label: "Analytics",
                    link: "#",
                    parentId: "dashboard",
                },
                // {
                //     id: "crm",
                //     label: "CRM",
                //     link: "#",
                //     parentId: "dashboard",
                // // },
                // {
                //     id: "ecommerce",
                //     label: "Ecommerce",
                //     link: "#",
                //     parentId: "dashboard",
                // },
                // {
                //     id: "crypto",
                //     label: "Crypto",
                //     link: "#",
                //     parentId: "dashboard",
                // },
                // {
                //     id: "projects",
                //     label: "Projects",
                //     link: "#",
                //     parentId: "dashboard",
                // },
                // {
                //     id: "nft",
                //     label: "NFT",
                //     link: "#",
                //     parentId: "dashboard",
                // },
                // {
                //     id: "job",
                //     label: "Job",
                //     link: "#",
                //     parentId: "dashboard",
                    
                // },
            ],
        },
        // {
        //     id: "apps",
        //     label: "Apps",
        //     icon: "ri-apps-2-line",
        //     link: "/#",
        //     click: function (e) {
        //         e.preventDefault();
        //         setIsApps(!isApps);
        //         setIscurrentState('Apps');
        //         updateIconSidebar(e);
        //     },
        //     stateVariables: isApps,
        //     subItems: [
        //         {
        //             id: "calendar",
        //             label: "Calendar",
        //             link: "#",
        //             parentId: "apps",
        //         },
        //         {
        //             id: "chat",
        //             label: "Chat",
        //             link: "#",
        //             parentId: "apps",
        //         },
        //         {
        //             id: "mailbox",
        //             label: "Email",
        //             link: "/#",
        //             parentId: "apps",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setEmail(!isEmail);
        //             },
        //             stateVariables: isEmail,
        //             childItems: [
        //                 {
        //                     id: 1,
        //                     label: "Mailbox",
        //                     link: "#",
        //                     parentId: "apps"
        //                 },
        //                 {
        //                     id: 2,
        //                     label: "Email Templates",
        //                     link: "/#",
        //                     parentId: "apps",
        //                     isChildItem: true,
        //                     stateVariables: isSubEmail,
        //                     click: function (e) {
        //                         e.preventDefault();
        //                         setSubEmail(!isSubEmail);
        //                     },
        //                     childItems: [
        //                         { id: 2, label: "Basic Action", link: "#", parentId: "apps" },
        //                         { id: 3, label: "Ecommerce Action", link: "#", parentId: "apps" },
        //                     ],
        //                 },
        //             ]
        //         },
        //         {
        //             id: "appsecommerce",
        //             label: "Ecommerce",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsEcommerce(!isEcommerce);
        //             },
        //             parentId: "apps",
        //             stateVariables: isEcommerce,
        //             childItems: [
        //                 { id: 1, label: "Products", link: "#", parentId: "apps" },
        //                 { id: 2, label: "Product Details", link: "#", parentId: "apps" },
        //                 { id: 3, label: "Create Product", link: "#", parentId: "apps" },
        //                 { id: 4, label: "Orders", link: "#", parentId: "apps" },
        //                 { id: 5, label: "Order Details", link: "#", parentId: "apps" },
        //                 { id: 6, label: "Customers", link: "#", parentId: "apps" },
        //                 { id: 7, label: "Shopping Cart", link: "#", parentId: "apps" },
        //                 { id: 8, label: "Checkout", link: "#", parentId: "apps" },
        //                 { id: 9, label: "Sellers", link: "#", parentId: "apps" },
        //                 { id: 10, label: "Seller Details", link: "#", parentId: "apps" },
        //             ]
        //         },
        //         {
        //             id: "appsprojects",
        //             label: "Projects",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsProjects(!isProjects);
        //             },
        //             parentId: "apps",
        //             stateVariables: isProjects,
        //             childItems: [
        //                 { id: 1, label: "List", link: "#", parentId: "apps", },
        //                 { id: 2, label: "Overview", link: "#", parentId: "apps", },
        //                 { id: 3, label: "Create Project", link: "#", parentId: "apps", },
        //             ]
        //         },
        //         {
        //             id: "tasks",
        //             label: "Tasks",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsTasks(!isTasks);
        //             },
        //             parentId: "apps",
        //             stateVariables: isTasks,
        //             childItems: [
        //                 { id: 1, label: "List View", link: "#", parentId: "apps", },
        //                 { id: 2, label: "Task Details", link: "#", parentId: "apps", },
        //             ]
        //         },
        //         {
        //             id: "appscrm",
        //             label: "CRM",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsCRM(!isCRM);
        //             },
        //             parentId: "apps",
        //             stateVariables: isCRM,
        //             childItems: [
        //                 { id: 1, label: "Contacts", link: "#" },
        //                 { id: 2, label: "Companies", link: "#" },
        //                 { id: 3, label: "Deals", link: "#" },
        //                 { id: 4, label: "Leads", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "appscrypto",
        //             label: "Crypto",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsCrypto(!isCrypto);
        //             },
        //             parentId: "apps",
        //             stateVariables: isCrypto,
        //             childItems: [
        //                 { id: 1, label: "Transactions", link: "#" },
        //                 { id: 2, label: "Buy & Sell", link: "#" },
        //                 { id: 3, label: "Orders", link: "#" },
        //                 { id: 4, label: "My Wallet", link: "#" },
        //                 { id: 5, label: "ICO List", link: "#" },
        //                 { id: 6, label: "KYC Application", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "invoices",
        //             label: "Invoices",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsInvoices(!isInvoices);
        //             },
        //             parentId: "apps",
        //             stateVariables: isInvoices,
        //             childItems: [
        //                 { id: 1, label: "List View", link: "#" },
        //                 { id: 2, label: "Details", link: "#" },
        //                 { id: 3, label: "Create Invoice", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "supportTickets",
        //             label: "Support Tickets",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsSupportTickets(!isSupportTickets);
        //             },
        //             parentId: "apps",
        //             stateVariables: isSupportTickets,
        //             childItems: [
        //                 { id: 1, label: "List View", link: "#" },
        //                 { id: 2, label: "Ticket Details", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "NFTMarketplace",
        //             label: "NFT Marketplace",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsNFTMarketplace(!isNFTMarketplace);
        //             },
        //             parentId: "apps",
        //             stateVariables: isNFTMarketplace,
        //             childItems: [
        //                 { id: 1, label: "Marketplace", link: "#" },
        //                 { id: 2, label: "Explore Now", link: "#" },
        //                 { id: 3, label: "Live Auction", link: "#" },
        //                 { id: 4, label: "Item Details", link: "#" },
        //                 { id: 5, label: "Collections", link: "#" },
        //                 { id: 6, label: "Creators", link: "#" },
        //                 { id: 7, label: "Ranking", link: "#" },
        //                 { id: 8, label: "Wallet Connect", link: "#" },
        //                 { id: 9, label: "Create NFT", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "filemanager",
        //             label: "File Manager",
        //             link: "#",
        //             parentId: "apps",
        //         },
        //         {
        //             id: "todo",
        //             label: "To Do",
        //             link: "#",
        //             parentId: "apps",
        //         },
        //         {
        //             id: "job",
        //             label: "Jobs",
        //             link: "/#",
        //             parentId: "apps",
        //             // badgeName: "New",
        //             // badgeColor: "success",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsJobs(!isJobs);
        //             },
        //             stateVariables: isJobs,
        //             childItems: [
        //                 {
        //                     id: 1,
        //                     label: "Statistics",
        //                     link: "#",
        //                     parentId: "apps",
        //                 },
        //                 {
        //                     id: 2,
        //                     label: "Job Lists",
        //                     link: "/#",
        //                     parentId: "apps",
        //                     isChildItem: true,
        //                     stateVariables: isJobList,
        //                     click: function (e) {
        //                         e.preventDefault();
        //                         setIsJobList(!isJobList);
        //                     },
        //                     childItems: [
        //                         {
        //                             id: 1,
        //                             label: "List",
        //                             link: "#",
        //                             parentId: "apps",
        //                         },
        //                         {
        //                             id: 2,
        //                             label: "Grid",
        //                             link: "#",
        //                             parentId: "apps",
        //                         },
        //                         {
        //                             id: 3,
        //                             label: "Overview",
        //                             link: "#",
        //                             parentId: "apps",
        //                         },
        //                     ],
        //                 },
        //                 {
        //                     id: 3,
        //                     label: "Candidate Lists",
        //                     link: "/#",
        //                     parentId: "apps",
        //                     isChildItem: true,
        //                     stateVariables: isCandidateList,
        //                     click: function (e) {
        //                         e.preventDefault();
        //                         setIsCandidateList(!isCandidateList);
        //                     },
        //                     childItems: [
        //                         {
        //                             id: 1,
        //                             label: "List View",
        //                             link: "#",
        //                             parentId: "apps",
        //                         },
        //                         {
        //                             id: 2,
        //                             label: "Grid View",
        //                             link: "#",
        //                             parentId: "apps",
        //                         },
        //                     ],
        //                 },
        //                 {
        //                     id: 4,
        //                     label: "Application",
        //                     link: "#",
        //                     parentId: "apps",
        //                 },
        //                 {
        //                     id: 5,
        //                     label: "New Job",
        //                     link: "#",
        //                     parentId: "apps",
        //                 },
        //                 {
        //                     id: 6,
        //                     label: "Companies List",
        //                     link: "#",
        //                     parentId: "apps",
        //                 },
        //                 {
        //                     id: 7,
        //                     label: "Job Categories",
        //                     link: "#",
        //                     parentId: "apps",
        //                 },
        //             ],
        //         },
        //         {
        //             id: "apikey",
        //             label: "API Key",
        //             link: "#",
        //             parentId: "apps",
        //             // badgeName: "New",
        //             // badgeColor: "success"
        //         },
        //     ],
        // },
        // {
        //     label: "pages",
        //     isHeader: true,
        // },
        // {
        //     id: "authentication",
        //     label: "Authentication",
        //     icon: "ri-account-circle-line",
        //     link: "/#",
        //     click: function (e) {
        //         e.preventDefault();
        //         setIsAuth(!isAuth);
        //         setIscurrentState('Auth');
        //         updateIconSidebar(e);
        //     },
        //     stateVariables: isAuth,
        //     subItems: [
        //         {
        //             id: "signIn",
        //             label: "Sign In",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsSignIn(!isSignIn);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isSignIn,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "signUp",
        //             label: "Sign Up",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsSignUp(!isSignUp);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isSignUp,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "passwordReset",
        //             label: "Password Reset",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsPasswordReset(!isPasswordReset);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isPasswordReset,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "passwordCreate",
        //             label: "Password Create",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsPasswordCreate(!isPasswordCreate);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isPasswordCreate,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "lockScreen",
        //             label: "Lock Screen",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsLockScreen(!isLockScreen);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isLockScreen,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "logout",
        //             label: "Logout",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsLogout(!isLogout);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isLogout,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "successMessage",
        //             label: "Success Message",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsSuccessMessage(!isSuccessMessage);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isSuccessMessage,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "twoStepVerification",
        //             label: "Two Step Verification",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsVerification(!isVerification);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isVerification,
        //             childItems: [
        //                 { id: 1, label: "Basic", link: "#" },
        //                 { id: 2, label: "Cover", link: "#" },
        //             ]
        //         },
        //         {
        //             id: "errors",
        //             label: "Errors",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsError(!isError);
        //             },
        //             parentId: "authentication",
        //             stateVariables: isError,
        //             childItems: [
        //                 { id: 1, label: "404 Basic", link: "#" },
        //                 { id: 2, label: "404 Cover", link: "#" },
        //                 { id: 3, label: "404 Alt", link: "#" },
        //                 { id: 4, label: "500", link: "#" },
        //                 { id: 5, label: "Offline Page", link: "#" },
        //             ]
        //         },
        //     ],
        // },
        // {
        //     id: "pages",
        //     label: "Pages",
        //     icon: "ri-pages-line",
        //     link: "/#",
        //     click: function (e) {
        //         e.preventDefault();
        //         setIsPages(!isPages);
        //         setIscurrentState('Pages');
        //         updateIconSidebar(e);
        //     },
        //     stateVariables: isPages,
        //     subItems: [
        //         {
        //             id: "starter",
        //             label: "Starter",
        //             link: "#",
        //             parentId: "pages",
        //         },
        //         {
        //             id: "profile",
        //             label: "Profile",
        //             link: "/#",
        //             isChildItem: true,
        //             click: function (e) {
        //                 e.preventDefault();
        //                 setIsProfile(!isProfile);
        //             },
        //             parentId: "pages",
        //             stateVariables: isProfile,
        //             childItems: [
        //                 { id: 1, label: "Simple Page", link: "#", parentId: "pages" },
        //                 { id: 2, label: "Settings", link: "#", parentId: "pages" },
        //             ]
        //         },
        //         { id: "team", label: "Team", link: "#", parentId: "pages" },
        //         { id: "timeline", label: "Timeline", link: "#", parentId: "pages" },
        //         { id: "faqs", label: "FAQs", link: "#", parentId: "pages" },
        //         { id: "pricing", label: "Pricing", link: "#", parentId: "pages" },
        //         { id: "gallery", label: "Gallery", link: "#", parentId: "pages" },
        //         { id: "maintenance", label: "Maintenance", link: "/pages-maintenance", parentId: "pages" },
        //         { id: "comingSoon", label: "Coming Soon", link: "/pages-coming-soon", parentId: "pages" },
        //         { id: "sitemap", label: "Sitemap", link: "#", parentId: "pages" },
        //         { id: "searchResults", label: "Search Results", link: "#", parentId: "pages" },
        //         {
        //             id: "PrivecyPolicy", label: "Privacy Policy", link: "#", parentId: "pages",
        //             // badgeColor: "success", badgeName: "New", 
        //         },
        //         {
        //             id: "TermsCondition", label: "Terms Condition", link: "#", parentId: "pages",
        //             // badgeColor: "success", badgeName: "New", 
        //         },
        //     ],
        // },
        // {
        //     id: "landing",
        //     label: "Landing",
        //     icon: "ri-rocket-line",
        //     link: "/#",
        //     stateVariables: isLanding,
        //     click: function (e) {
        //         e.preventDefault();
        //         setIsLanding(!isLanding);
        //         setIscurrentState('Landing');
        //         updateIconSidebar(e);
        //     },
        //     subItems: [
        //         { id: "onePage", label: "One Page", link: "#", parentId: "landing" },
        //         { id: "nftLanding", label: "NFT Landing", link: "#", parentId: "landing" },
        //         {
        //             id: "jobLanding", label: "Job", link: "#", parentId: "landing",
        //             // badgeColor: "success", badgeName: "New"
        //         },
        //     ],
        // },
        {
            label: "General",
            isHeader: true,
        },
        {
            id: "baseUi",
            label: "Settings",
            icon: "ri-pencil-ruler-2-line",
            link: "/#",
            click: function (e) {
                e.preventDefault();
                setIsBaseUi(!isBaseUi);
                setIscurrentState('BaseUi');
                updateIconSidebar(e);
            },
             stateVariables: isBaseUi,
             subItems: [
                { id: "organization", label: "Organization", link: "/organization", parentId: "baseUi" },
                { id: "employee", label: "Employee", link: "/employee", parentId: "baseUi" },
                { id: "roles", label: "Roles", link: "/roles", parentId: "baseUi" },
                { id: "workschedule", label: "WorkSchedule", link: "/workschedule", parentId: "baseUi" },
            //     { id: "badges", label: "Badges", link: "#", parentId: "baseUi" },
            //     { id: "buttons", label: "Buttons", link: "#", parentId: "baseUi" },
            //     { id: "colors", label: "Colors", link: "#", parentId: "baseUi" },
            //     { id: "cards", label: "Cards", link: "#", parentId: "baseUi" },
            //     { id: "carousel", label: "Carousel", link: "#", parentId: "baseUi" },
            //     { id: "dropdowns", label: "Dropdowns", link: "#", parentId: "baseUi" },
            //     { id: "grid", label: "Grid", link: "#", parentId: "baseUi" },
            //     { id: "images", label: "Images", link: "#", parentId: "baseUi" },
            //     { id: "tabs", label: "Tabs", link: "#", parentId: "baseUi" },
            //     { id: "accordions", label: "Accordion & Collapse", link: "#", parentId: "baseUi" },
            //     { id: "modals", label: "Modals", link: "#", parentId: "baseUi" },
            //     { id: "offcanvas", label: "Offcanvas", link: "#", parentId: "baseUi" },
            //     { id: "placeholders", label: "Placeholders", link: "#", parentId: "baseUi" },
            //     { id: "progress", label: "Progress", link: "#", parentId: "baseUi" },
            //     { id: "notifications", label: "Notifications", link: "#", parentId: "baseUi" },
            //     { id: "media", label: "Media object", link: "#", parentId: "baseUi" },
            //     { id: "embedvideo", label: "Embed Video", link: "#", parentId: "baseUi" },
            //     { id: "typography", label: "Typography", link: "#", parentId: "baseUi" },
            //     { id: "lists", label: "Lists", link: "#", parentId: "baseUi" },
            //     { id: "links", label: "Links", link: "#", parentId: "baseUi", badgeColor: "success", badgeName: "New" },
            //     { id: "general", label: "General", link: "#", parentId: "baseUi" },
            //     { id: "ribbons", label: "Ribbons", link: "#", parentId: "baseUi" },
            //     { id: "utilities", label: "Utilities", link: "#", parentId: "baseUi" },
             ],
        },
    //     {
    //         id: "advanceUi",
    //         label: "Advance UI",
    //         icon: "ri-stack-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsAdvanceUi(!isAdvanceUi);
    //             setIscurrentState('AdvanceUi');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isAdvanceUi,
    //         subItems: [
    //             { id: "nestablelist", label: "Nestable List", link: "#", parentId: "advanceUi" },
    //             { id: "scrollbar", label: "Scrollbar", link: "#", parentId: "advanceUi" },
    //             { id: "animation", label: "Animation", link: "#", parentId: "advanceUi" },
    //             { id: "tour", label: "Tour", link: "#", parentId: "advanceUi" },
    //             { id: "swiperslider", label: "Swiper Slider", link: "#", parentId: "advanceUi" },
    //             { id: "ratings", label: "Ratings", link: "#", parentId: "advanceUi" },
    //             { id: "highlight", label: "Highlight", link: "#", parentId: "advanceUi" },
    //         ],
    //     },
    //     {
    //         id: "widgets",
    //         label: "Widgets",
    //         icon: "ri-honour-line",
    //         link: "#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIscurrentState('Widgets');
    //         }
    //     },
    //     {
    //         id: "forms",
    //         label: "Forms",
    //         icon: "ri-file-list-3-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsForms(!isForms);
    //             setIscurrentState('Forms');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isForms,
    //         subItems: [
    //             { id: "basicelements", label: "Basic Elements", link: "#", parentId: "forms" },
    //             { id: "formselect", label: "Form Select", link: "#", parentId: "forms" },
    //             { id: "checkboxsradios", label: "Checkboxs & Radios", link: "#", parentId: "forms" },
    //             { id: "pickers", label: "Pickers", link: "#", parentId: "forms" },
    //             { id: "inputmasks", label: "Input Masks", link: "#", parentId: "forms" },
    //             { id: "advanced", label: "Advanced", link: "#", parentId: "forms" },
    //             { id: "rangeslider", label: "Range Slider", link: "#", parentId: "forms" },
    //             { id: "validation", label: "Validation", link: "#", parentId: "forms" },
    //             { id: "wizard", label: "Wizard", link: "#", parentId: "forms" },
    //             { id: "editors", label: "Editors", link: "#", parentId: "forms" },
    //             { id: "fileuploads", label: "File Uploads", link: "#", parentId: "forms" },
    //             { id: "formlayouts", label: "Form Layouts", link: "#", parentId: "forms" },
    //             { id: "select2", label: "Select2", link: "#", parentId: "forms" },
    //         ],
    //     },
    //     {
    //         id: "tables",
    //         label: "Tables",
    //         icon: "ri-layout-grid-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsTables(!isTables);
    //             setIscurrentState('Tables');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isTables,
    //         subItems: [
    //             { id: "basictables", label: "Basic Tables", link: "#", parentId: "tables" },
    //             { id: "listjs", label: "List Js", link: "#", parentId: "tables" },
    //             { id: "reactdatatables", label: "React Datatables", link: "#", parentId: "tables" },
    //         ],
    //     },
    //     {
    //         id: "charts",
    //         label: "Charts",
    //         icon: "ri-pie-chart-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsCharts(!isCharts);
    //             setIscurrentState('Charts');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isCharts,
    //         subItems: [
    //             {
    //                 id: "apexcharts",
    //                 label: "Apexcharts",
    //                 link: "/#",
    //                 isChildItem: true,
    //                 click: function (e) {
    //                     e.preventDefault();
    //                     setIsApex(!isApex);
    //                 },
    //                 stateVariables: isApex,
    //                 childItems: [
    //                     { id: 1, label: "Line", link: "#" },
    //                     { id: 2, label: "Area", link: "#" },
    //                     { id: 3, label: "Column", link: "#" },
    //                     { id: 4, label: "Bar", link: "#" },
    //                     { id: 5, label: "Mixed", link: "#" },
    //                     { id: 6, label: "Timeline", link: "#" },
    //                     { id: 7, label: "Range Area", link: "#", parentId: "apexcharts", badgeColor: "success", badgeName: "New" },
    //                     { id: 8, label: "Funnel", link: "#", parentId: "apexcharts", badgeColor: "success", badgeName: "New" },
    //                     { id: 9, label: "Candlstick", link: "#" },
    //                     { id: 10, label: "Boxplot", link: "#" },
    //                     { id: 11, label: "Bubble", link: "#" },
    //                     { id: 12, label: "Scatter", link: "#" },
    //                     { id: 13, label: "Heatmap", link: "#" },
    //                     { id: 14, label: "Treemap", link: "#" },
    //                     { id: 15, label: "Pie", link: "#" },
    //                     { id: 16, label: "Radialbar", link: "#" },
    //                     { id: 17, label: "Radar", link: "#" },
    //                     { id: 18, label: "Polar Area", link: "#" },
    //                 ]
    //             },
    //             { id: "chartjs", label: "Chartjs", link: "#", parentId: "charts" },
    //             { id: "echarts", label: "Echarts", link: "#", parentId: "charts" },

    //         ],
    //     },
    //     {
    //         id: "icons",
    //         label: "Icons",
    //         icon: "ri-compasses-2-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsIcons(!isIcons);
    //             setIscurrentState('Icons');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isIcons,
    //         subItems: [
    //             { id: "remix", label: "Remix", link: "#", parentId: "icons" },
    //             { id: "boxicons", label: "Boxicons", link: "#", parentId: "icons" },
    //             { id: "materialdesign", label: "Material Design", link: "#", parentId: "icons" },
    //             { id: "lineawesome", label: "Line Awesome", link: "#", parentId: "icons" },
    //             { id: "feather", label: "Feather", link: "#", parentId: "icons" },
    //             { id: "crypto", label: "Crypto SVG", link: "#", parentId: "icons" },
    //         ],
    //     },
    //     {
    //         id: "maps",
    //         label: "Maps",
    //         icon: "ri-map-pin-line",
    //         link: "/#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsMaps(!isMaps);
    //             setIscurrentState('Maps');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isMaps,
    //         subItems: [
    //             { id: "google", label: "Google", link: "#", parentId: "maps" },
    //             { id: "vector", label: "Vector", link: "#", parentId: "maps" },
    //             { id: "leaflet", label: "Leaflet", link: "#", parentId: "maps" },
    //         ],
    //     },
    //     {
    //         id: "multilevel",
    //         label: "Multi Level",
    //         icon: "ri-share-line",
    //         link: "#",
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsMultiLevel(!isMultiLevel);
    //             setIscurrentState('MuliLevel');
    //             updateIconSidebar(e);
    //         },
    //         stateVariables: isMultiLevel,
    //         subItems: [
    //             { id: "level1.1", label: "Level 1.1", link: "#", parentId: "multilevel" },
    //             {
    //                 id: "level1.2",
    //                 label: "Level 1.2",
    //                 link: "#",
    //                 isChildItem: true,
    //                 click: function (e) {
    //                     e.preventDefault();
    //                     setIsLevel1(!isLevel1);
    //                 },
    //                 stateVariables: isLevel1,
    //                 childItems: [
    //                     { id: 1, label: "Level 2.1", link: "#" },
    //                     {
    //                         id: "level2.2",
    //                         label: "Level 2.2",
    //                         link: "#",
    //                         isChildItem: true,
    //                         click: function (e) {
    //                             e.preventDefault();
    //                             setIsLevel2(!isLevel2);
    //                         },
    //                         stateVariables: isLevel2,
    //                         childItems: [
    //                             { id: 1, label: "Level 3.1", link: "#" },
    //                             { id: 2, label: "Level 3.2", link: "#" },
    //                         ]
    //                     },
    //                 ]
    //             },
    //         ],
    //     },
     ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
