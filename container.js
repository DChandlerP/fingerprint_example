import { createIcons, Layers, Eye, Cpu, AlertOctagon, Skull, FileCode, Factory, Tag, ScanSearch, ArrowRight, ArrowDown } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {

    // --- Init Static Icons ---
    createIcons({
        icons: {
            layers: Layers,
            eye: Eye,
            cpu: Cpu,
            'alert-octagon': AlertOctagon,
            skull: Skull,
            'file-code': FileCode,
            factory: Factory,
            tag: Tag,
            'scan-search': ScanSearch,
            'arrow-right': ArrowRight,
            'arrow-down': ArrowDown
        },
        attrs: { class: "w-6 h-6" }
    });

});
