import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";

export const Navbar = () => {
  return (
    <NextUINavbar position="sticky" className="bg-transparent justify-end">
      <NavbarContent className="flex" justify="end">
        <NavbarItem className="flex gap-2">
          <Link isExternal href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-violet-900" />
          </Link>
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );
};
