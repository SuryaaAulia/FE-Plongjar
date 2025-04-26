export interface NavItem {
    label: string;
    icon?: string;
    routerLink: string;
    children?: NavItem[];
}

export interface SideNavToggle {
    screenWidth: number;
    collapsed: boolean;
}