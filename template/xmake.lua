-- Project configuration
set_project("Skeleton")
set_languages("c++11")

-- Specify the target
target("Skeleton")
    set_kind("shared")

    -- Source files
    add_files(path.join("$(env EX_AFTERFX_SDK)", "Util/*.cpp"))
    add_files("Skeleton_Strings.cpp", "Skeleton.cpp")

    -- Include directories
    add_includedirs(
        path.join("$(env EX_AFTERFX_SDK)", "Headers"),
        path.join("$(env EX_AFTERFX_SDK)", "Headers/SP"),
        path.join("$(env EX_AFTERFX_SDK)", "Util"),
        path.join("$(env EX_AFTERFX_SDK)", "Resources"),
        "."
    )

    -- macOS specific configurations
    if is_plat("macosx") then
        set_values("xcode.codesign.identity", "Developer ID")
        set_values("xcode.bundle.id", "com.adobe.AfterEffects." .. project.name())
        set_values("xcode.bundle.info.plist", {
            ["CFBundleIdentifier"] = "com.adobe.AfterEffects." .. project.name(),
            ["CFBundleName"] = project.name(),
            ["CFBundleVersion"] = "1.0.0",
            ["CFBundleExecutable"] = project.name(),
            ["CFBundleShortVersionString"] = "1.0"
        })

        set_targetdir("$(buildir)/$(plat)/$(arch)/")
        add_defines("__MACH__")
        add_macos_links("Cocoa")
        set_archs("arm64", "x86_64")

        -- Add custom command for PiPL
        after_build(function (target)
            os.execv("/Developer/Tools/rez", {
                path.join(os.projectdir(), "SkeletonPiPL.r"),
                "-o", path.join(target:targetdir(), "SkeletonPiPL.rsrc"),
                "-useDF",
                "-i", path.join("$(env EX_AFTERFX_SDK)", "Headers"),
                "-i", path.join("$(env EX_AFTERFX_SDK)", "Headers/SP"),
                "-i", path.join("$(env EX_AFTERFX_SDK)", "Util"),
                "-i", path.join("$(env EX_AFTERFX_SDK)", "Resources"),
                "-D __MACH__"
            })
        end)

        add_files("$(buildir)/macosx/$(arch)/SkeletonPiPL.rsrc", {macosx_bundle = true})
        set_suffix("")
    end

    -- Windows specific configurations
    if is_plat("windows") then
        add_defines("_CRT_SECURE_NO_WARNINGS")
        set_suffix(".aex")

        -- Add custom commands for PiPL on Windows
        after_build(function (target)
            os.exec("cl /I ..\\$(env EX_AFTERFX_SDK)\\Headers /I ..\\$(env EX_AFTERFX_SDK)\\Headers\\SP /I ..\\$(env EX_AFTERFX_SDK)\\Util /I ..\\$(env EX_AFTERFX_SDK)\\Resources /EP %s > %s.rr",
                path.join(os.projectdir(), "SkeletonPiPL.r"),
                path.join(target:targetdir(), project.name())
            )
            os.exec("%s %s.rr %s.rrc", path.join("$(env EX_AFTERFX_SDK)", "Resources/PiPLtool.exe"), target:targetdir(), target:targetdir())
            os.exec("cl /D MSWindows /EP %s.rrc > %s.rc", target:targetdir(), target:targetdir())
        end)

        add_files(path.join("$(buildir)", "windows", "$(arch)", project.name() .. ".rc"))
    end
