set_project("plugin")
set_languages("c++11")

target("plugin")
    set_kind("shared")
    set_extension(".aex")
    add_files("src/**/*.cpp")
    add_includedirs("$(env EX_AFTERFX_SDK)/Headers")
    add_includedirs("$(env EX_AFTERFX_SDK)/Headers/SP")
    add_includedirs("$(env EX_AFTERFX_SDK)/Util")
    add_includedirs("$(env EX_AFTERFX_SDK)/Resources")
    add_includedirs("$(env EX_PREMIERE_SDK)/Headers")
    add_includedirs("$(env EX_PREMIERE_SDK)/Utils")

    if is_plat("macosx") then
        add_frameworks("Cocoa")
    end

