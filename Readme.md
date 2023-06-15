# Creating Cross Platform Applications with .NET Blazor
## Iowa Code Camp 2023
Tim Purdum

tim.purdum@dymaptic.com

<a href="https://fosstodon.org/@TimPurdum">@TimPurdum@fosstodon.org</a>

https://timpurdum.dev

<br/>

## Create Server App

```powershell
dotnet new list
dotnet new sln
dotnet new blazorserver-empty -o Server
dotnet sln add Server/Server.csproj
cd Server
dotnet run -lp https
```



### Server `_Host.cshtml`

```html
<meta name="viewport" content="width=device-width">
```

### Load Data

#### `Program.cs`

```csharp
builder.Services.AddHttpClient();
```

#### `_Imports.razor`

```csharp
@using System.Text.Json
```

#### `Index.razor`

```csharp
@code {
    [Inject]
    public HttpClient HttpClient { get; set; } = default!;

    protected override async Task OnInitializedAsync()
    {
        var response = await HttpClient.GetAsync("https://api.census.gov/data/2019/pep/population?get=NAME,DATE_CODE,POP&for=county:*&in=state:19");
        var content = await response.Content.ReadAsStringAsync();
        var rows = JsonSerializer.Deserialize<List<string[]>>(content)!;
        rows.RemoveAt(0); // Remove header row
        var counties = rows.Select(r => r[0].Replace(", Iowa", "")).Distinct().Order().ToList();
        foreach (string county in counties)
        {
            var popDiff = int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "12")[2]) -
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "1")[2]);
            countyRows.Add(new CountyYearPopulation(county, 
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "3")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "4")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "5")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "6")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "7")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "8")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "9")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "10")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "11")[2]),
                int.Parse(rows.First(r => r[0].Contains(county) && r[1] == "12")[2]),
                popDiff));
        }
    }
    
    private List<CountyYearPopulation> countyRows = new List<CountyYearPopulation>();
    record CountyYearPopulation(string County, int Pop2010, int Pop2011, int Pop2012, int Pop2013, int Pop2014, int Pop2015, int Pop2016, int Pop2017, int Pop2018, int Pop2019, int PopulationChange)
    {
    	public int[] ToDataSet => new int[] { Pop2010, Pop2011, Pop2012, Pop2013, Pop2014, Pop2015, Pop2016, Pop2017, Pop2018, Pop2019 };
    }
}
```

```html
<h1>Iowa County Population Change</h1>
<h2>2010-2019</h2>

<table>
    <thead>
        <tr>
            <th>County</th>
            @for(int i = 2010; i < 2020; i++)
            {
                <th>@i</th>
            }
            <th>Population Change</th>
        </tr>
    </thead>
    <tbody>
        @foreach (var countyRow in countyRows)
        {
            <tr>
                <td>@countyRow.County</td>
                <td>@countyRow.Pop2010.ToString("N0")</td>
                <td>@countyRow.Pop2011.ToString("N0")</td>
                <td>@countyRow.Pop2012.ToString("N0")</td>
                <td>@countyRow.Pop2013.ToString("N0")</td>
                <td>@countyRow.Pop2014.ToString("N0")</td>
                <td>@countyRow.Pop2015.ToString("N0")</td>
                <td>@countyRow.Pop2016.ToString("N0")</td>
                <td>@countyRow.Pop2017.ToString("N0")</td>
                <td>@countyRow.Pop2018.ToString("N0")</td>
                <td>@countyRow.Pop2019.ToString("N0")</td>
                <td style="font-weight: bold; @(countyRow.PopulationChange >= 0 ? "color: green" : "color:red")">
                    @countyRow.PopulationChange.ToString("N0")
                </td>

            </tr>
        }
    </tbody>
</table>
```

#### `site.css`

```css
main {
    margin: 1rem;
}

table {
    margin: 1rem;
    border-collapse: collapse;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    font-size: 14px;
    cursor: pointer;
    height: 500px;
    display: block;
    overflow-y: scroll;
}

tr:hover {
    background-color: lightgray;
}

th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

thead {
    position: sticky;
    top: 0;
    z-index: 1;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
    color: #333;
    width: 10%;
}
```

### Add State Row

#### `Index.razor`

```csharp
    private CountyYearPopulation stateRow => new CountyYearPopulation("State of Iowa",
        countyRows.Sum(r => r.Pop2010),
        countyRows.Sum(r => r.Pop2011),
        countyRows.Sum(r => r.Pop2012),
        countyRows.Sum(r => r.Pop2013),
        countyRows.Sum(r => r.Pop2014),
        countyRows.Sum(r => r.Pop2015),
        countyRows.Sum(r => r.Pop2016),
        countyRows.Sum(r => r.Pop2017),
        countyRows.Sum(r => r.Pop2018),
        countyRows.Sum(r => r.Pop2019),
        countyRows.Sum(r => r.PopulationChange));
```

### Add Search Field

#### `Index.razor`

```html
<div class="header-section">
    <div class="header-column">
        <label>
            Search by County Name: <input type="text" @bind="searchText" />
            <button @onclick="() => searchText = string.Empty">Clear</button>
        </label>
    </div>
</div>

... @foreach (var countyRow in filteredRows) ...
```

```csharp
    private List<CountyYearPopulation> filteredRows => string.IsNullOrWhiteSpace(searchText) 
        ? countyRows.Concat(new [] {stateRow}).ToList()
        : countyRows.Where(r => r.County.Contains(searchText, StringComparison.OrdinalIgnoreCase)).ToList()
            .Concat(new [] {stateRow}).ToList();

	private string searchText = string.Empty;
```

### Sort by Column

#### `_Imports.razor`

```csharp
@using Microsoft.AspNetCore.Components.Forms
```

#### `Index.razor`

```html
		<br />
        <label>
            Sort By Column:
            <InputSelect @bind-Value="sortColumn">
                <option value="County">County</option>
                <option value="Pop2010">2010</option>
                <option value="Pop2011">2011</option>
                <option value="Pop2012">2012</option>
                <option value="Pop2013">2013</option>
                <option value="Pop2014">2014</option>
                <option value="Pop2015">2015</option>
                <option value="Pop2016">2016</option>
                <option value="Pop2017">2017</option>
                <option value="Pop2018">2018</option>
                <option value="Pop2019">2019</option>
                <option value="PopulationChange">Population Change</option>
            </InputSelect>
            <InputRadioGroup @bind-Value="sortDirection" Name="Direction">
                <InputRadio Name="Direction" Value="@("Ascending")" />Ascending
                <InputRadio Name="Direction" Value="@("Descending")" />Descending
            </InputRadioGroup>
            <button @onclick="SortRows">Sort</button>
        </label>
```

```csharp
    private void SortRows() 
    {
        if (sortDirection == "Ascending")
        {
            countyRows = countyRows.OrderBy(r => r.GetType().GetProperty(sortColumn)?.GetValue(r, null)).ToList();
        }
        else
        {
            countyRows = countyRows.OrderByDescending(r => r.GetType().GetProperty(sortColumn)?.GetValue(r, null)).ToList();
        }
    }

	private string sortColumn = "County";
    private string sortDirection = "Ascending";
```

### Add JavaScript to GetWidth

#### `_Host.cshtml`

```html
	<meta name="viewport" content="width=device-width">
```

#### `functions.js`

```js
export function getWindowWidth() {
    return window.innerWidth;
}
```

#### `Index.razor`

```csharp
	[Inject]
    public IJSRuntime JSRuntime { get; set; } = default!;

	protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            functionsModule = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "functions.js");
            windowWidth = await functionsModule.InvokeAsync<int>("getWindowWidth");
        }
    }

	private IJSObjectReference? functionsModule;
    private int windowWidth;
```

```html
@if (windowWidth > 800)
{
	<table>
    ...    
	</table>
}
else
{
	foreach (var countyRow in filteredRows)
    {
        <div class="panel">
            <label><b>@countyRow.County</b></label>
            <label><b>2010: </b>@countyRow.Pop2010.ToString("N0")</label>
            <label><b>2011: </b>@countyRow.Pop2011.ToString("N0")</label>
            <label><b>2012: </b>@countyRow.Pop2012.ToString("N0")</label>
            <label><b>2013: </b>@countyRow.Pop2013.ToString("N0")</label>
            <label><b>2014: </b>@countyRow.Pop2014.ToString("N0")</label>
            <label><b>2015: </b>@countyRow.Pop2015.ToString("N0")</label>
            <label><b>2016: </b>@countyRow.Pop2016.ToString("N0")</label>
            <label><b>2017: </b>@countyRow.Pop2017.ToString("N0")</label>
            <label><b>2018: </b>@countyRow.Pop2018.ToString("N0")</label>
            <label><b>2019: </b>@countyRow.Pop2019.ToString("N0")</label>
            <label style="font-weight: bold; @(countyRow.PopulationChange >= 0 ? "color: green" : "color:red")">
                <b>Population Change: </b>@countyRow.PopulationChange.ToString("N0")</label>
        </div>
    }
}
```

#### `site.css`

```css
.panel {
    border: 1px solid black;
    padding: 1rem;
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
}

@media (max-width: 1000px) {
    .header-section {
        flex-direction: column;
        height: 400px;
    }
}
```

### Add Chart JS

#### `_Host.cshtml`

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### `site.css`

```css
.header-section {
    display: flex;
    flex-direction: row;
    margin: 1rem 0;
    height: 240px;
}

.header-column {
    display: flex;
    flex-direction: column;
    margin: 0 1rem;
    justify-content: center;
    width: 100%;
}

.header-column-right {
    align-items: flex-end;
}
```

#### `functions.js`

```js
let chart;

export function createChart(chartData, chartLabel, labels, canvasElement) {
  if (chart !== undefined && chart !== null) {
    chart.destroy();
  }
  chart = new Chart(canvasElement, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: chartLabel,
        data: chartData,
        borderWidth: 1,
        backgroundColor: generateColors(chartData)
      }],
    }
  });
}

function generateColors(chartData) {
    const sortedData = chartData.slice().sort((a, b) => a - b);
    const max = sortedData[sortedData.length - 1];
    const min = sortedData[0];
    const range = max - min;
    const colors = [];
    for (let i = 0; i < chartData.length; i++) {
        const value = chartData[i];
        const position = sortedData.indexOf(value);
        const red = Math.round(255 - (position / (chartData.length - 1) * 255));
        const green = Math.round(position / (chartData.length - 1) * 255);
        const blue = 0;
        const color = `rgba(${red}, ${green}, ${blue}, 0.2)`;
        colors.push(color);
    }
    return colors;
}
```

#### `Index.razor`

```html
	<div class="header-column header-column-right">
        <canvas id="chartCanvas" @ref="chartCanvas" height="200"></canvas>
    </div>
...
	<tr @onclick="@(() => RowClicked(countyRow))">
...
    <div class="panel" @onclick="@(() => RowClicked(countyRow))">
```

```csharp
 	private async Task RowClicked(CountyYearPopulation countyRow)
    {
        await functionsModule!.InvokeVoidAsync("createChart", countyRow.ToDataSet, $"{countyRow.County} Population 2010-2019", 
            columnNames, chartCanvas);
    }

	private string[] columnNames = new string[] { "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019" };
	private ElementReference chartCanvas;
```

## Create Wasm App

```bash
cd ..
dotnet new list
dotnet new blazorwasm-empty -o Wasm
dotnet sln add Wasm/Wasm.csproj
cd Wasm
dotnet run
```

## Create Shared Library

```bash
cd ..
dotnet new list
dotnet new razorclasslib -o Shared
dotnet sln add Shared/Shared.csproj
```

#### `_Imports.razor`

```csharp
@using Microsoft.AspNetCore.Components.Forms
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Web
@using Microsoft.JSInterop
@using Shared
@using Shared.Pages
@using System.Text.Json
```

### Delete from Shared

- `_Component1.razor`
- `_Component1.razor.css`
- `ExampleJsInterop.cs`
- `wwwroot/background.png`
- `wwwroot/exampleInterop.js`

### Move to Shared from Server

- `MainLayout.razor`
- `Pages/Index.razor`
- `wwwroot/css/site.css`
- `wwwroot/functions.js`

### Add to Server

```bash
dotnet add reference ..\Shared\Shared.csproj
```

#### `_Host.cshtml`

```html
    <link href="_content/Shared/css/site.css" rel="stylesheet" />
    <link href="_content/Shared/" />
```

#### `_Imports.razor`

```csharp
@using Shared
@using Shared.Pages
```

#### `App.razor`

```html
AdditionalAssemblies="@(new [] {typeof(MainLayout).Assembly})"
```

#### `Index.razor`

```csharp
functionsModule = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/Shared/functions.js");
```

### Delete from Wasm

- `MainLayout.razor`
- `Pages/Index.razor`
- `wwwroot/css/app.css`

### Add to Wasm

```bash
dotnet add reference ..\Shared\Shared.csproj
```

#### `wwwroot/index.html`

```html
    <meta name="viewport" content="width=device-width">
    <link href="_content/Shared/css/site.css" rel="stylesheet" />
    <link href="_content/Shared/" />
...
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### `_Imports.razor`

```csharp
@using Shared
@using Shared.Pages
```

#### `App.razor`

```html
AdditionalAssemblies="@(new [] {typeof(MainLayout).Assembly})"
```

## Add MAUI App

```bash
dotnet new list
dotnet new maui-blazor -o Maui
dotnet sln add Maui/Maui.csproj
```

### Delete from Maui

- `Shared` folder
- `Pages` folder
- `Data` folder

### Add to Maui

```bash
dotnet add reference ..\Shared\Shared.csproj
```

#### `wwwroot/index.html`

```html
    <meta name="viewport" content="width=device-width">
    <link href="_content/Shared/css/site.css" rel="stylesheet" />
    <link href="_content/Shared/" />
...
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### `_Imports.razor`

```csharp
@using Shared
@using Shared.Pages
// remove @using Maui.Shared
```

#### `Main.razor`

```html
AdditionalAssemblies="@(new [] {typeof(MainLayout).Assembly})"
```

#### `Program.cs`

```csharp
builder.Services.AddScoped(_ => new HttpClient());
// remove using Maui.Data;
```

### Launch Visual Studio

- Right-click on Solution, open `Configuration Manager`
- Add `Deploy` to Maui app



## Add Local GeoLocation Service

#### `Platforms/Android/MainApplication.cs`

```csharp
[assembly: UsesPermission(Android.Manifest.Permission.AccessCoarseLocation)]
[assembly: UsesPermission(Android.Manifest.Permission.AccessFineLocation)]
[assembly: UsesFeature("android.hardware.location", Required = false)]
[assembly: UsesFeature("android.hardware.location.gps", Required = false)]
[assembly: UsesFeature("android.hardware.location.network", Required = false)]
```

#### `MainPage.xaml`

```xaml
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:local="clr-namespace:Maui"
             x:Class="Maui.MainPage"
             BackgroundColor="{DynamicResource PageBackgroundColor}">

    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>
        <Label x:Name="GeoLocationLabel" HeightRequest="20" />
        <BlazorWebView Grid.Row="1"
            x:Name="blazorWebView" HostPage="wwwroot/index.html">
            <BlazorWebView.RootComponents>
                <RootComponent Selector="#app" ComponentType="{x:Type local:Main}" />
            </BlazorWebView.RootComponents>
        </BlazorWebView>
    </Grid>

</ContentPage>
```

#### `MainPage.xaml.cs`

```csharp
using System.ComponentModel;

namespace Maui;

public partial class MainPage : ContentPage
{
	public MainPage()
	{
		InitializeComponent();
	}
	

	protected override async void OnAppearing()
	{
		try
		{
			Location location = await Geolocation.GetLastKnownLocationAsync();
			if (location is not null)
			{
				GeoLocationLabel.Text = $"Latitude: {location.Latitude}, Longitude: {location.Longitude}";
			}
		}
		catch (Exception ex)
		{
			GeoLocationLabel.Text = $"Error: {ex.Message}";
		}
	}
}
```