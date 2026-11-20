using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

/// <summary>Creates and manages Facebook/Instagram ads through the Meta Marketing API.</summary>
public interface IMetaAdsService
{
    Task<MetaAdsStatusDto> GetStatusAsync();

    Task<List<MetaAdProductDto>> GetProductsAsync();

    /// <summary>Uploads a JPEG/PNG to the ad account's image library and returns its hash.</summary>
    Task<MetaAdImageDto> UploadImageAsync(Stream content, string fileName, string contentType);

    /// <summary>Meta's own rendering of the creative (Facebook feed + Instagram feed) as iframe URLs.</summary>
    Task<List<MetaAdPreviewDto>> PreviewAsync(MetaAdPublishDto request);

    /// <summary>Creates the creative, then (for a new delivery) the campaign and ad set, then the ad.</summary>
    Task<MetaAdPublishResultDto> PublishAsync(MetaAdPublishDto request, string publishedBy);

    /// <summary>Audience size and estimated daily reach for a new ad set's targeting and budget.</summary>
    Task<MetaAdEstimateDto> EstimateAsync(MetaAdDeliveryDto delivery);

    Task<List<MetaAdSetSummaryDto>> GetAdSetsAsync();

    Task<List<MetaAdSummaryDto>> GetAdsAsync(int limit);

    Task SetAdStatusAsync(string adId, string status, string changedBy);
}
