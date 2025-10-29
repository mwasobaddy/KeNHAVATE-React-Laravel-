import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Lightbulb, 
    Users, 
    ClipboardCheck,
    UserCheck,
    UsersIcon,
    Settings,
    FileText,
    Award,
    Clock,
    Trophy,
    Inbox,
    Send,
    Mail
} from 'lucide-react';
import AppLogo from './app-logo';

// Helper function to get role-based navigation items
const getMainNavItems = (user: any): NavItem[] => {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Ideas',
            href: '/ideas',
            icon: Lightbulb,
            items: [
                {
                    title: 'Create Idea',
                    href: '/ideas/create',
                    icon: Lightbulb,
                },
                {
                    title: 'Submissions',
                    href: '/ideas/submissions',
                    icon: FileText,
                },
                // {
                //     title: 'My Ideas Status',
                //     href: '/review/author/dashboard',
                //     icon: Clock,
                // },
                {
                    title: 'Collaboration Hub',
                    href: '/ideas/collaboration/hub',
                    icon: Users,
                }
            ],
        },
        {
            title: 'Collaboration',
            href: '/collaboration',
            icon: Users,
            items: [
                {
                    title: 'Inbox',
                    href: '/collaboration/inbox',
                    icon: Inbox,
                },
                {
                    title: 'Outbox',
                    href: '/collaboration/outbox',
                    icon: Send,
                },
                {
                    title: 'My Proposals',
                    href: '/collaboration/my-proposals',
                    icon: FileText,
                },
                {
                    title: 'Received Proposals',
                    href: '/collaboration/received-proposals',
                    icon: Mail,
                },
            ],
        },
        {
            title: 'Challenges',
            href: '/challenges',
            icon: Trophy,
            items: [
                {
                    title: 'Browse Challenges',
                    href: '/challenges',
                    icon: Trophy,
                },
                {
                    title: 'My Submissions',
                    href: '/challenges/submissions/my-submissions',
                    icon: FileText,
                },
            ],
        },
    ];

    // Review section based on user roles
    const reviewItems: NavItem[] = [];
    
    if (user?.roles?.some((role: any) => role.name === 'subject-matter-expert') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'SME Idea Reviews',
            href: '/review/sme/dashboard',
            icon: UserCheck,
        });
    }

    if (user?.roles?.some((role: any) => role.name === 'board') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'Board Idea   Reviews',
            href: '/review/board/dashboard',
            icon: UsersIcon,
        });
    }

    if (user?.roles?.some((role: any) => role.name === 'deputy-director') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'DD Idea Workflow',
            href: '/review/dd/dashboard',
            icon: Settings,
        });
    }

    // Challenge review sections based on user roles
    const challengeReviewItems: NavItem[] = [];
    
    if (user?.roles?.some((role: any) => role.name === 'challenge-reviewer-expert') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'SME Challenge Reviews',
            href: '/review/challenges/sme/dashboard',
            icon: UserCheck,
        });
    }

    if (user?.roles?.some((role: any) => role.name === 'board') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'Board Challenge Reviews',
            href: '/review/challenges/board/dashboard',
            icon: UsersIcon,
        });
    }

    if (user?.roles?.some((role: any) => role.name === 'deputy-director') ||
        user?.roles?.some((role: any) => role.name === 'admin')) {
        reviewItems.push({
            title: 'DD Challenge Workflow',
            href: '/review/challenges/dd/dashboard',
            icon: Settings,
        });
    }

    // Add challenge reviews as a group if user has any challenge review roles
    if (challengeReviewItems.length > 0) {
        reviewItems.push({
            title: 'Challenge Reviews',
            href: '#',
            icon: Award,
            items: challengeReviewItems,
        });
    }

    // Add review section if user has any review roles
    if (reviewItems.length > 0) {
        baseItems.push({
            title: 'Reviews',
            href: '/review',
            icon: ClipboardCheck,
            items: reviewItems,
        });
    }

    // Challenge Management section for DD and Admin
    const challengeManagementItems: NavItem[] = [];
    
    if (user?.permissions?.some((permission: any) => permission.name === 'manage.challenges') || 
        user?.roles?.some((role: any) => role.name === 'admin') ||
        user?.roles?.some((role: any) => role.name === 'deputy-director')) {
        challengeManagementItems.push(
            {
                title: 'Manage Challenges',
                href: '/dd/challenges',
                icon: Trophy,
            },
            {
                title: 'Create Challenge',
                href: '/dd/challenges/create',
                icon: Award,
            }
        );
    }

    if (challengeManagementItems.length > 0) {
        baseItems.push({
            title: 'Challenge Management',
            href: '/dd/challenges',
            icon: Trophy,
            items: challengeManagementItems,
        });
    }

    // Admin section
    if (user?.roles?.some((role: any) => role.name === 'admin')) {
        baseItems.push({
            title: 'Administration',
            href: '/admin',
            icon: Settings,
            items: [
                {
                    title: 'Admin Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'User Management',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'System Settings',
                    href: '/admin/settings',
                    icon: Settings,
                },
            ],
        });
    }

    return baseItems;
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const mainNavItems = getMainNavItems(auth.user);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
