const routeStyles = window.getComputedStyle(document.documentElement)

if(routeStyles.getPropertyValue('--book-cover-width-large') != null 
        && routeStyles.getPropertyValue('--book-cover-width-large') !== ''){
    ready()
}else{
    document.getElementById('main-css').addEventListener('load',ready)
}

function ready(){
    const coverWidth = parseFloat(routeStyles.getPropertyValue('--book-cover-width-large'))
    const coverAspectRatio = parseFloat(routeStyles.getPropertyValue('--book-cover-aspect-ratio'))
    const coverHeight = coverWidth / coverAspectRatio

    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );
    
    FilePond.setOptions({
        stylePanelAspectRatio : 1 / coverAspectRatio,
        imageResizeTargetWidth : coverWidth,
        imageResizeTargetHeight : coverHeight
    })
    
    FilePond.parse(document.body);
}

