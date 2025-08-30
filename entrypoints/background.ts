export default defineBackground(() => {
	// Set up sidepanel when extension is installed or starts up
	const setupSidePanel = () => {
		browser.sidePanel.setOptions({
			path: "sidepanel.html",
			enabled: true,
		});

		// Set panel behavior to open on action click
		browser.sidePanel
			.setPanelBehavior({
				openPanelOnActionClick: true,
			})
			.catch((error) => {
				console.error("Failed to set panel behavior:", error);
			});
	};

	// Set up on installation
	browser.runtime.onInstalled.addListener(setupSidePanel);

	// Also set up on startup (in case it wasn't set properly)
	browser.runtime.onStartup.addListener(setupSidePanel);

	// Manual fallback - this listener should not be needed with setPanelBehavior
	// but keeping it as a backup
	browser.action.onClicked.addListener(async (tab) => {
		try {
			await browser.sidePanel.open({ windowId: tab.windowId });
		} catch (error) {
			console.error("Failed to open sidepanel:", error);
		}
	});

	// Initialize on load as well
	setupSidePanel();
});
