local pipl = path.join(os.curdir(), "pipl.r")
local output_rr = path.join(os.curdir(), "plugin.rr")
local output_rsrc = path.join(os.curdir(), "plugin.rsrc")
local output_rc = path.join(os.curdir(), "plugin.rc")

local includes_args = {
    "/I $(env EX_AFTERFX_SDK)/Headers/",
    "/I $(env EX_AFTERFX_SDK)/Headers/SP",
    "/I $(env EX_AFTERFX_SDK)/Util",
    "/I $(env EX_AFTERFX_SDK)/Resources"
}

set_project("plugin")
set_languages("c++17")

add_rules("plugin.compile_commands.autoupdate", {outputdir = ".vscode"})
add_rules("mode.debug", "mode.release")

target("plugin")
    set_kind("shared")
    set_fpmodels("precise")
    
    local build_path = "$(env ADBE_PLUGIN_BUILDPATH)" or "/output"
    set_targetdir("/output")
    set_basename("{{name}}")
    set_extension(".aex")

    add_files("$(env EX_AFTERFX_SDK)/Util/*.cpp", "src/**/private/*.cpp")

    add_includedirs("src")
    add_includedirs("$(env EX_AFTERFX_SDK)/Headers", "$(env EX_AFTERFX_SDK)/Headers/SP", "$(env EX_AFTERFX_SDK)/Util", "$(env EX_AFTERFX_SDK)/Resources", "$(env EX_PREMIERE_SDK)/Headers", "$(env EX_PREMIERE_SDK)/Utils")

    set_pcxxheader("$(env EX_AFTERFX_SDK)/Headers/AE_Effect.h")

    add_defines("_UNICODE", "UNICODE", "_CRT_SECURE_NO_WARNINGS")
    
    add_cxxflags("cl::/GR", "cl::/nologo")
    add_ldflags("/nologo")

    if is_mode("debug") then 
        set_symbols("debug", "edit")
        set_optimize("none")
        set_warnings("less")
        add_defines("_DEBUG", "DEBUG")

        if is_plat("windows") then
            set_runtimes("MDd")
        end
    elseif is_mode("release") then 
        set_symbols("hidden")
        set_warnings("more")
        set_optimize("fast")

        if is_plat("windows") then
            set_runtimes("MD")
        end
    end

    if is_plat("windows") then 
        set_toolchains("msvc")
        add_cxxflags("/utf-8", "/Gz")
        add_ldflags("/nologo", "/dynamicbase:no", "/machine:x64")
        add_defines("MSWindows", "_WINDOWS", "_WINDLL", "WIN32")

        before_build(function (target)
            import("lib.detect.find_tool")
            import("lib.detect.find_program")
            import("core.base.process")
            import("tools.utils.get_vc_include_path")
            local cl = find_tool("cl")

            local include_paths = get_vc_include_path()

            -- Adobe forcing us to do adobe things...
            local rez = find_program("PiPLtool", {paths = {"$(env EX_AFTERFX_SDK)/Resources/"}})
            os.execv("powershell", {
                "-noninteractive", "-nologo", "-OutputFormat", "Text",
                "-File", path.join(os.curdir(), "tools", "pipl.ps1"),
                "-ClProgram", cl.program,
                "-IncludeArgs", include_paths,
                "-Pipl", pipl,
                "-OutputRR", output_rr,
                "-OutputRsrc", output_rsrc,
                "-OutputRC", output_rc,
                "-Rez", rez
            })
        end)
    elseif is_plat("macosx") then
        set_toolchains("xcode")
        add_rules("xcode.bundle")

        add_frameworks("Cocoa")
        add_files("plugin-Info.plist")
        add_defines("__MACH__", "__APPLE__")

        before_build(function (target)
            os.exec("rez \"" .. pipl .. "\" -o \"" .. output_rsrc .. "\" -useDF -F Carbon -F CoreServices " .. table.concat(includes, " ") .. " -D __MACH__")
        end)
    end

    after_build(function (target)
        print("🛠️  ~ Don't forget to copy " .. target:targetfile() .. " to $(env ADBE_PLUGIN_BUILDPATH)")
    end)

target_end()